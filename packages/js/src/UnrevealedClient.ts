import { FEATURES_URL, TRACKING_URL } from './constants';
import { FeatureKey, Team, User } from './types';
import { serializeBody } from './utils';

type OnChange = (errorfeatures: FeatureKey[]) => void;
type OnError = (error: unknown) => void;
type Subscription = symbol;

export class UnrevealedClient {
  private features: Set<FeatureKey> = new Set();
  private isLoading = false;
  private lastFetchPromise: Promise<Response> | null = null;
  private changeSubscriptions: Map<Subscription, OnChange> = new Map();
  private errorSubscriptions: Map<Subscription, OnError> = new Map();

  constructor(private clientKey: string) {}

  async identify({ user, team }: { user: User | null; team?: Team | null }) {
    if (user) {
      this._identify('user', { userId: user.id, traits: user.traits });
    }

    if (team) {
      this._identify('team', {
        teamId: team.id,
        userId: user?.id,
        traits: team.traits,
      });
    }

    try {
      this.isLoading = true;
      const currentFetchPromise = fetch(FEATURES_URL, {
        method: 'post',
        headers: { 'Client-Key': this.clientKey },
        body: serializeBody({ user, team }),
      });
      this.lastFetchPromise = currentFetchPromise;
      const response = await this.lastFetchPromise;

      if (response.status === 400) {
        const { error } = await response.json();
        throw new Error(error);
      }

      if (this.lastFetchPromise !== currentFetchPromise) {
        return;
      }

      const data: { features: FeatureKey[] } = await response.json();
      this.features = new Set(data.features);
      this.broadcastChange(this.features);
    } catch (err) {
      this.broadcastError(err);
    } finally {
      this.isLoading = false;
    }
  }

  getFeature(featureKey: FeatureKey) {
    return {
      enabled: this.features.has(featureKey),
      loading: this.isLoading,
    };
  }

  getEnabledFeatureKeys() {
    return [...this.features];
  }

  subscribe(onChange: OnChange, onError?: OnError): Subscription {
    const subscription = Symbol();

    this.changeSubscriptions.set(subscription, onChange);
    if (onError) {
      this.errorSubscriptions.set(subscription, onError);
    }

    return subscription;
  }

  unsubscribe(subscription: Subscription) {
    this.changeSubscriptions.delete(subscription);
    this.errorSubscriptions.delete(subscription);
  }

  private broadcastChange(features: Set<FeatureKey>) {
    this.changeSubscriptions.forEach((onChange) => {
      onChange([...features]);
    });
  }

  private broadcastError(err: unknown) {
    this.errorSubscriptions.forEach((onError) => {
      onError(err);
    });
  }

  private async _identify(type: 'user' | 'team', body: unknown) {
    try {
      const response = await fetch(`${TRACKING_URL}/identify-${type}`, {
        method: 'post',
        headers: {
          'Client-Key': this.clientKey,
          'Content-Type': 'application/json',
        },
        body: serializeBody(body),
      });
      if (response.status < 300) {
        return;
      }

      throw new Error(`Error identifying user: ${response.statusText}`);
    } catch (err) {
      this.broadcastError(err);
    }
  }
}
