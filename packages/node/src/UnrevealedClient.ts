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

  constructor({ apiKey, apiUrl = SSE_API_URL }: UnrevealedClientOptions) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
  }

  async connect() {
    this.readyState = ReadyState.CONNECTING;

    try {
      const eventSource = this.createEventSource();

      eventSource.addEventListener('put', (event) => this.handlePut(event));
      eventSource.addEventListener('patch', (event) => this.handlePatch(event));
      eventSource.addEventListener('error', (event) => this.handleError(event));

      this.eventSource = eventSource;
    } catch (err) {
      this.logger.error('Error initializing Unrevealed client');
      this.close();
      throw err;
    }
  }

  async close() {
    this.eventSource?.close();
    this.eventSource = null;
    this.featureAccesses = {};
    this.readyState = ReadyState.CLOSED;
  }

  private createEventSource() {
    return new EventSource(`${this.apiUrl}/rules`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });
  }

  private handleError(event: MessageEvent) {
    let message = 'Error connecting to Unrevealed API';

    if ('message' in event) {
      message = `${message}: ${event.message}`;
    }

    this.logger.error(message);

    if (this.readyState === ReadyState.CONNECTING) {
      this.close();
    }
  }

  private handlePut(event: MessageEvent) {
    try {
      this.featureAccesses = JSON.parse(event.data);
      if (this.readyState === ReadyState.CONNECTING) {
        this.readyState = ReadyState.READY;
        this.logger.log('Connection to Unrevealed API established');
      }
    } catch (err) {
      this.close();
      this.logger.error('Error parsing data, disconnecting Unrevealed');
    }
  }

  private handlePatch(event: MessageEvent) {
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
      this.logger.error('Error parsing data');
    }
  }
}
