import { useEffect, useState } from 'react';
import { FEATURES_URL } from './constants';
import { Team, User } from './types';
import { serializeBody } from './utils';

interface FetchFeaturesOptions {
  clientKey: string;
  user: User | null;
  team: Team | null;
}

export function useFetchFeatures({
  clientKey,
  user,
  team,
}: FetchFeaturesOptions) {
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    fetch(FEATURES_URL, {
      method: 'post',
      headers: { 'Client-Key': clientKey },
      body: serializeBody({ user, team }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!isCancelled) {
          setFeatures(data.features);
        }
      })
      .catch((err: Error) => {
        if (!isCancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [user, team, clientKey]);

  return {
    loading,
    error,
    features,
  };
}
