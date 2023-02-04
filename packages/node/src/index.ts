import EventSource from 'eventsource';

const SSE_API_URL = 'https://sse.unrevealed.tech';

interface FeatureAccess {
  fullAccess: boolean;
  accessTeams: string[];
  accessUsers: string[];
}

export class UnrevealedClient {
  private eventSource: EventSource | null = null;
  private featureAccesses: Record<string, FeatureAccess> = {};

  constructor(private apiKey: string, private apiUrl: string = SSE_API_URL) {}

  async connect() {
    try {
      this.eventSource = new EventSource(`${this.apiUrl}/rules`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      this.eventSource.onerror = (...err) => {
        console.log(err);
        console.log('Error connecting to Unrevealed API');
      };

      this.eventSource.addEventListener('put', (event) => {
        try {
          this.handlePutData(JSON.parse(event.data));
        } catch (err) {
          console.log('Error');
        }
      });
      this.eventSource.addEventListener('patch', (event) => {
        try {
          this.handlePatchData(JSON.parse(event.data));
        } catch (err) {
          console.log('Error');
        }
      });
    } catch (err) {
      console.error('Error initializing Unrevealed client');
      throw err;
    }
  }

  async close() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.featureAccesses = {};
  }

  private handlePutData(data: Record<string, FeatureAccess>) {
    this.featureAccesses = data;
  }

  private handlePatchData(data: Record<string, FeatureAccess | null>) {
    Object.keys(data).map((featureId) => {
      if (!data[featureId]) {
        if (featureId in this.featureAccesses) {
          delete this.featureAccesses[featureId];
        }
        return;
      }

      this.featureAccesses[featureId] = data[featureId]!;
    });
  }
}
