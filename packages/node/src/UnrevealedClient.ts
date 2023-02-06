import EventSource from 'eventsource';
import { Logger } from './Logger';

const SSE_API_URL = 'https://sse.unrevealed.tech';

interface FeatureAccess {
  fullAccess: boolean;
  accessTeams: string[];
  accessUsers: string[];
}

enum ReadyState {
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
  private eventSource: EventSource | null = null;
  private featureAccesses: Record<string, FeatureAccess> = {};
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private logger = new Logger();
  private readyState: ReadyState = ReadyState.UNINITIALIZED;
  private connectAttempts = 0;

  constructor({ apiKey, apiUrl = SSE_API_URL }: UnrevealedClientOptions) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  connect() {
    const isConnectableState =
      this.readyState === ReadyState.UNINITIALIZED ||
      this.readyState === ReadyState.CLOSED;
    const hasReachedMaxAttempts = this.connectAttempts >= RETRY_MAX_ATTEMPTS;

    if (!isConnectableState || hasReachedMaxAttempts) {
      return;
    }

    this.connectAttempts += 1;
    this.readyState = ReadyState.CONNECTING;

    try {
      const eventSource = this.createEventSource();

      eventSource.addEventListener('put', (event) => this.handlePut(event));
      eventSource.addEventListener('patch', (event) => this.handlePatch(event));
      eventSource.addEventListener('error', (event) => this.handleError(event));

      this.eventSource = eventSource;
    } catch (err) {
      this.close();
      this.logger.error(`Error initializing Unrevealed client: ${err}`);
    }
  }

  close() {
    this.closeConnection();
    this.featureAccesses = {};
  }

  private closeConnection() {
    this.eventSource?.close();
    this.eventSource = null;
    this.readyState =
      this.readyState === ReadyState.CONNECTING
        ? ReadyState.UNINITIALIZED
        : ReadyState.CLOSED;
  }

  private createEventSource() {
    return new EventSource(`${this.apiUrl}/rules`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  private handleError(event: MessageEvent) {
    if (this.readyState === ReadyState.READY) {
      this.logger.log('Connection to Unrevealed was closed, reconnecting');
      this.closeConnection();
      this.connect();
    } else if (this.readyState === ReadyState.CONNECTING) {
      this.close();
      if ('status' in event && event.status === 401) {
        this.logger.error('Unauthorized, please check your API key');
        return;
      }
      let errorMessage = 'Could not connect to Unrevealed';
      if ('message' in event) {
        errorMessage = `${errorMessage}: ${event.message}`;
      }
      this.logger.error(errorMessage);

      if (this.connectAttempts > RETRY_MAX_ATTEMPTS) {
        this.logger.error('Maximum connection attempts reached');

        this.connectAttempts = 0;
        return;
      }

      this.logger.log('Reconnecting...');

      setTimeout(() => this.connect(), RETRY_INTERVAL_MS);
    }
  }

  private handlePut(event: MessageEvent) {
    if (this.readyState !== ReadyState.CONNECTING) {
      return;
    }

    try {
      this.connectAttempts = 0;
      this.readyState = ReadyState.READY;
      this.featureAccesses = JSON.parse(event.data);

      this.logger.log('Connection to Unrevealed established');
    } catch (err) {
      this.logger.error('Could not parse push event, closing connection');

      this.close();
    }
  }

  private handlePatch(event: MessageEvent) {
    if (this.readyState !== ReadyState.READY) {
      return;
    }

    try {
      const featureAccesses: Record<string, FeatureAccess | null> = JSON.parse(
        event.data,
      );
      Object.keys(featureAccesses).map((featureId) => {
        if (featureAccesses[featureId] === null) {
          if (featureId in this.featureAccesses) {
            delete this.featureAccesses[featureId];
          }
          return;
        }

        this.featureAccesses[featureId] = featureAccesses[featureId]!;
      });
    } catch (err) {
      this.logger.error('Could not parse patch event');
    }
  }
}
