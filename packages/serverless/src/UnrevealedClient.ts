import crypto from 'crypto';
import { EDGE_API_URL, MAX_SHA1, TRACKING_API_URL } from './constants';
import { getFetch } from './fetch';
import { FeatureAccess, FeatureKey, Team, User } from './types';

export interface UnrevealedClientOptions {
  apiKey: string;
  fetchMode?: 'lazy' | 'eager';
}

interface DevUnrevealedClientOptions {
  edgeApiUrl?: string;
  trackingApiUrl?: string;
}

export class UnrevealedClient {
  private apiKey: string;
  private edgeApiUrl: string;
  private trackingApiUrl: string;
  private fetchPromise: Promise<unknown> | undefined;
  private featureAccesses: Map<FeatureKey, FeatureAccess> = new Map();

  constructor(options: UnrevealedClientOptions) {
    const {
      apiKey,
      edgeApiUrl = EDGE_API_URL,
      trackingApiUrl = TRACKING_API_URL,
      fetchMode = 'lazy',
    } = options as UnrevealedClientOptions & DevUnrevealedClientOptions;

    this.apiKey = apiKey;
    this.edgeApiUrl = edgeApiUrl;
    this.trackingApiUrl = trackingApiUrl;

    if (fetchMode === 'eager') {
      this.fetchRules();
    }
  }

  async isFeatureEnabled(
    featureKey: FeatureKey,
    identity: { user?: User; team?: Team },
  ): Promise<boolean> {
    await this.fetchRules();
    return this._isFeatureEnabled(featureKey, identity);
  }

  async getEnabledFeatures({
    user,
    team,
  }: { user?: User; team?: Team } = {}): Promise<FeatureKey[]> {
    await this.fetchRules();

    return this.featureKeys.filter((featureKey) =>
      this._isFeatureEnabled(featureKey, { user, team }),
    );
  }

  async identify({ user, team }: { user?: User; team?: Team }) {
    if (user) {
      await this.track('user', { userId: user.id, traits: user.traits });
    }

    if (team) {
      await this.track('team', {
        teamId: team.id,
        userId: user?.id,
        traits: team.traits,
      });
    }
  }

  private async fetchRules() {
    this.fetchPromise ??= this._fetchRules();
    await this.fetchPromise;
  }

  private async track(type: 'user' | 'team', body: unknown) {
    const fetch = getFetch();

    try {
      await fetch(`${this.trackingApiUrl}/identify-${type}`, {
        method: 'post',
        headers: {
          'Client-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      }
    }
  }

  private _isFeatureEnabled(
    featureKey: FeatureKey,
    { user, team }: { user?: User; team?: Team } = {},
  ) {
    const featureAccess = this.featureAccesses.get(featureKey);

    if (!featureAccess) {
      return false;
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
    if (
      user &&
      featureAccess.userPercentageAccess > 0 &&
      this.normalizeKey(`${featureKey}-${user.id}`) <
        featureAccess.userPercentageAccess / 100
    ) {
      return true;
    }
    if (
      team &&
      featureAccess.teamPercentageAccess > 0 &&
      this.normalizeKey(`${featureKey}-${team.id}`) <
        featureAccess.teamPercentageAccess / 100
    ) {
      return true;
    }

    return false;
  }

  private get featureKeys(): FeatureKey[] {
    return [...this.featureAccesses.keys()];
  }

  private async _fetchRules() {
    const fetch = getFetch();
    const response = await fetch(`${this.edgeApiUrl}/rules`, {
      method: 'get',
      headers: { 'Client-Key': this.apiKey },
    });

    if (response.status === 400) {
      const { error } = await response.json();
      console.error(error);
    }
    const { rules }: { rules: Record<FeatureKey, FeatureAccess> } =
      await response.json();

    const entries = Object.keys(rules).map(
      (featureKey) =>
        [featureKey as FeatureKey, rules[featureKey] as FeatureAccess] as const,
    );
    this.featureAccesses = new Map(entries);
  }

  private normalizeKey(key: string) {
    const hash = crypto.createHash('sha1');
    hash.update(key);
    const hashHex = hash.digest('hex');
    return Number(BigInt(`0x${hashHex}`)) / MAX_SHA1;
  }
}
