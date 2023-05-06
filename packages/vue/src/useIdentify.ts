import { inject } from 'vue';
import { FEATURES_URL, TRACKING_URL } from './constants';
import { apiKeyInjectionKey, featuresInjectionKey } from './injectionKeys';
import { Team, User } from './types';
import { serializeBody } from './utils';

export function useIdentify() {
  const clientKey = inject(apiKeyInjectionKey);
  const features = inject(featuresInjectionKey);

  let lastFetchPromise: Promise<Response> | null = null;

  const track = async (type: 'user' | 'team', body: unknown) => {
    if (!clientKey) {
      return;
    }
    try {
      await fetch(`${TRACKING_URL}/identify-${type}`, {
        method: 'post',
        headers: {
          'Client-Key': clientKey,
          'Content-Type': 'application/json',
        },
        body: serializeBody(body),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const identify = async ({
    user,
    team,
  }: {
    user: User | null;
    team?: Team | null;
  }) => {
    console.log('identify');

    const trackUserAndTeam = async () => {
      if (user) {
        await track('user', { userId: user.id, traits: user.traits });
      }

      if (team) {
        await track('team', {
          teamId: team.id,
          userId: user?.id,
          traits: team.traits,
        });
      }
    };

    const fetchFeatures = async () => {
      if (!clientKey) {
        return;
      }
      const currentFetchPromise = fetch(FEATURES_URL, {
        method: 'post',
        headers: { 'Client-Key': clientKey },
        body: serializeBody({ user, team }),
      });

      lastFetchPromise = currentFetchPromise;

      try {
        const response = await currentFetchPromise;
        const data: { features: string[] } = await response.json();
        if (currentFetchPromise === lastFetchPromise) {
          if (features) {
            features.value = new Set(data.features);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    await Promise.all([trackUserAndTeam(), fetchFeatures()]);
  };

  return { identify };
}
