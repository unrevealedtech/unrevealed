import EventSource from 'eventsource';
import { UnauthorizedException } from './errors';
import { Logger } from './Logger';

const SSE_API_URL = 'https://sse.unrevealed.tech';

interface FeatureAccess {
  fullAccess: boolean;
  accessTeams: string[];
  accessUsers: string[];
}

export enum ReadyState {
  UNINITIALIZED,
  CONNECTING,
  READY,
  CLOSED,
}

const RETRY_INTERVAL_MS = 2000;
const RETRY_MAX_ATTEMPTS = 5;

export interface UnrevealedClientOptions {
  apiKey: string;
  apiUrl?: string;
}

export class UnrevealedClient {
  private _eventSource: EventSource | null = null;
  private _featureAccesses: Record<string, FeatureAccess> = {};
  private readonly _apiKey: string;
  private readonly _apiUrl: string;
  private _logger = new Logger();
  private _readyState: ReadyState = ReadyState.UNINITIALIZED;
  private _connectionPromise: Promise<void> | null = null;

  constructor({ apiKey, apiUrl = SSE_API_URL }: UnrevealedClientOptions) {
    this._apiKey = apiKey;
    this._apiUrl = apiUrl;
  }

  get readyState() {
    return this._readyState;
  }

  async connect(): Promise<boolean> {
    if (this._isReady()) {
      return true;
    }

    const isConnectableState =
      this._readyState === ReadyState.UNINITIALIZED ||
      this._readyState === ReadyState.CLOSED;
    if (isConnectableState) {
      this._connectionPromise = this._connectRecursive();
    }

    await this._connectionPromise;

    return this._isReady();
  }

  close() {
    this._closeExistingEventSource();
    this._readyState = ReadyState.CLOSED;
    this._featureAccesses = {};
  }

  private _isReady() {
    return this._readyState === ReadyState.READY;
  }

  private async _connectRecursive(attempt: number = 1) {
    this._readyState = ReadyState.CONNECTING;

    try {
      await this._connect();
      this._readyState = ReadyState.READY;
      this._logger.log('Connection to Unrevealed established');
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        this._logger.error('Unauthorized, please check your API key');
        return;
      }

      if (attempt >= RETRY_MAX_ATTEMPTS) {
        this._logger.error('Maximum connection attempts reached');
        this.close();
        return;
      }

      this._logger.error(`Connection to Unrevealed failed: ${err}`);
      this._logger.error(`Reconnecting...`);
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          await this._connectRecursive(attempt + 1);
          resolve();
        }, RETRY_INTERVAL_MS);
      });
    }
  }

  private async _connect() {
    this._closeExistingEventSource();

    return new Promise<void>((resolve, reject) => {
      const rejectPromise = (err: unknown) => {
        reject(err);
      };
      const resolvePromise = () => {
        resolve();
      };

      try {
        const eventSource = this._createEventSource();

        eventSource.addEventListener('error', (event) => {
          if (this._readyState === ReadyState.CONNECTING) {
            if ('status' in event && event.status === 401) {
              rejectPromise(new UnauthorizedException());
              return;
            }
            let errorMessage = 'Could not connect to Unrevealed';
            if ('message' in event) {
              errorMessage = `${errorMessage}: ${event.message}`;
            }
            rejectPromise(errorMessage);
            return;
          }

          this._handleError(event);
        });

        eventSource.addEventListener('put', async (event) => {
          try {
            this._handlePut(event);
            resolvePromise();
          } catch (err) {
            rejectPromise(err);
          }
        });

        eventSource.addEventListener('patch', (event) =>
          this._handlePatch(event),
        );

        this._eventSource = eventSource;
      } catch (err) {
        reject(new Error(`Error initializing Unrevealed client: ${err}`));
      }
    });
  }

  async rules() {
    await this._connectionPromise;

    return this._featureAccesses;
  }

  private _closeExistingEventSource() {
    this._eventSource?.close();
    this._eventSource = null;
  }

  private _createEventSource() {
    return new EventSource(`${this._apiUrl}/rules`, {
      headers: {
        Authorization: `Bearer ${this._apiKey}`,
      },
    });
  }

  private _handleError(_event: MessageEvent) {
    if (this._readyState === ReadyState.READY) {
      this._connectRecursive();
      return;
    }
  }

  private _handlePut(event: MessageEvent) {
    if (this._readyState !== ReadyState.CONNECTING) {
      return;
    }

    try {
      this._featureAccesses = JSON.parse(event.data);
    } catch (err) {
      throw new Error('Could not parse push event');
    }
  }

  private _handlePatch(event: MessageEvent) {
    if (this._readyState !== ReadyState.READY) {
      return;
    }

    try {
      const featureAccesses: Record<string, FeatureAccess | null> = JSON.parse(
        event.data,
      );
      Object.keys(featureAccesses).map((featureId) => {
        if (featureAccesses[featureId] === null) {
          if (featureId in this._featureAccesses) {
            delete this._featureAccesses[featureId];
          }
          return;
        }

        this._featureAccesses[featureId] = featureAccesses[featureId]!;
      });
    } catch (err) {
      this._logger.error('Could not parse patch event');
    }
  }
}
