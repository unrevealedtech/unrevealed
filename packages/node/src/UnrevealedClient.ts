import EventSource from 'eventsource';
import { UnauthorizedException } from './errors';
import { Logger, UnrevealedLogger } from './Logger';

const SSE_API_URL = 'https://sse.unrevealed.tech';
const TRACKING_API_URL = 'https://track.unrevealed.tech';

interface FeatureAccess {
  fullAccess: boolean;
  userAccess: string[];
  teamAccess: string[];
}

export enum ReadyState {
  UNINITIALIZED,
  CONNECTING,
  READY,
  CLOSED,
}

const RETRY_INTERVAL_MS = 2000;

export interface UnrevealedClientOptions {
  apiKey: string;
  logger?: Logger;
  defaults?: Record<string, boolean>;
}

/** Options used in dev and not exposed in the public API */
interface DevUnrevealedClientOptions {
  apiUrl?: string;
  trackingUrl?: string;
}

type AllUnrevealedClientOptions = UnrevealedClientOptions &
  DevUnrevealedClientOptions;

interface User {
  id: string;
  traits?: Record<string, unknown>;
}

interface Team {
  id: string;
  traits?: Record<string, unknown>;
}

export class UnrevealedClient<TFeatureKey extends string = string> {
  private _eventSource: EventSource | null = null;
  private _featureAccesses: Map<TFeatureKey, FeatureAccess> = new Map();
  private _readyState: ReadyState = ReadyState.UNINITIALIZED;
  private _connectionPromise: Promise<void> | null = null;
  private readonly _defaults: Map<TFeatureKey, boolean>;
  private readonly _apiKey: string;
  private readonly _apiUrl: string;
  private readonly _trackingUrl: string;
  private readonly _logger: Logger;

  constructor(options: UnrevealedClientOptions) {
    const { apiKey, apiUrl, trackingUrl, logger, defaults } =
      options as AllUnrevealedClientOptions;
    this._apiKey = apiKey;
    this._apiUrl = apiUrl || SSE_API_URL;
    this._trackingUrl = trackingUrl || TRACKING_API_URL;
    this._logger = logger ?? new UnrevealedLogger();

    const defaultsEntries = defaults
      ? Object.keys(defaults).map(
          (featureKey) =>
            [featureKey as TFeatureKey, defaults[featureKey]] as const,
        )
      : [];
    this._defaults = new Map(defaultsEntries);
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
    this._featureAccesses = new Map();
  }

  async isFeatureEnabled(
    featureKey: TFeatureKey,
    { user, team }: { user?: User; team?: Team } = {},
  ) {
    await this._connectionPromise;

    return this._isFeatureEnabledSync(featureKey, { user, team });
  }

  async getEnabledFeatures({
    user,
    team,
  }: { user?: User; team?: Team } = {}): Promise<TFeatureKey[]> {
    await this._connectionPromise;

    return this._featureKeys.filter((featureKey) =>
      this._isFeatureEnabledSync(featureKey, { user, team }),
    );
  }

  async identify({ user, team }: { user?: User; team?: Team }) {
    if (user) {
      await this._track('user', { userId: user.id, traits: user.traits });
    }

    if (team) {
      await this._track('team', {
        teamId: team.id,
        userId: user?.id,
        traits: team.traits,
      });
    }
  }

  async _track(type: 'user' | 'team', body: unknown) {
    await fetch(`${this._trackingUrl}/identify-${type}`, {
      method: 'post',
      headers: {
        'Client-Key': this._apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  private get _featureKeys(): TFeatureKey[] {
    return [
      ...new Set([...this._featureAccesses.keys(), ...this._defaults.keys()]),
    ];
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
      try {
        const eventSource = this._createEventSource();

        eventSource.addEventListener('error', (event) => {
          if (this._readyState === ReadyState.CONNECTING) {
            if ('status' in event && event.status === 401) {
              reject(new UnauthorizedException());
              return;
            }
            let errorMessage = 'Could not connect to Unrevealed';
            if ('message' in event) {
              errorMessage = `${errorMessage}: ${event.message}`;
            }
            reject(errorMessage);
            return;
          }

          this._handleError(event);
        });

        eventSource.addEventListener('put', async (event) => {
          try {
            this._handlePut(event);
            resolve();
          } catch (err) {
            reject(err);
          }
        });

        eventSource.addEventListener('patch', (event) => {
          this._handlePatch(event);
        });

        this._eventSource = eventSource;
      } catch (err) {
        reject(new Error(`Error initializing Unrevealed client: ${err}`));
      }
    });
  }

  private _isFeatureEnabledSync(
    featureKey: TFeatureKey,
    { user, team }: { user?: User; team?: Team } = {},
  ): boolean {
    const featureAccess = this._featureAccesses.get(featureKey);

    if (!featureAccess) {
      return this._defaults.get(featureKey) ?? false;
    }
    if (featureAccess.fullAccess) {
      return true;
    }
    if (user && featureAccess.userAccess.indexOf(user.id) !== -1) {
      return true;
    }
    if (team && featureAccess.teamAccess.indexOf(team.id) !== -1) {
      return true;
    }
    return false;
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
      const featureAccessesData = JSON.parse(event.data);
      const entries = Object.keys(featureAccessesData).map(
        (featureKey) =>
          [
            featureKey as TFeatureKey,
            featureAccessesData[featureKey] as FeatureAccess,
          ] as const,
      );
      this._featureAccesses = new Map(entries);
    } catch (err) {
      throw new Error('Could not parse push event');
    }
  }

  private _handlePatch(event: MessageEvent) {
    if (this._readyState !== ReadyState.READY) {
      return;
    }

    try {
      const newFeatureAccessesData: Record<TFeatureKey, FeatureAccess | null> =
        JSON.parse(event.data);
      const newFeatureKeys = Object.keys(
        newFeatureAccessesData,
      ) as TFeatureKey[];
      newFeatureKeys.forEach((featureId: TFeatureKey) => {
        const featureAccess = newFeatureAccessesData[featureId];
        if (featureAccess === null) {
          if (featureId in this._featureAccesses) {
            this._featureAccesses.delete(featureId);
          }
        } else {
          this._featureAccesses.set(featureId, featureAccess);
        }
      });
    } catch (err) {
      this._logger.error('Could not parse patch event');
    }
  }
}
