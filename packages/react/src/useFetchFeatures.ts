import { useEffect, useRef, useState } from 'react';
import { CachePolicy, getCachedFeatures, setCachedFeatures } from './cache';
import { FEATURES_URL } from './constants';
import { Team, User } from './types';
import { serializeBody } from './utils';

interface FetchFeaturesOptions {
  clientKey: string;
  user: User | null;
  team: Team | null;
  cachePolicy: CachePolicy;
}

export function useFetchFeatures({
  clientKey,
  user,
  team,
  cachePolicy,
}: FetchFeaturesOptions) {
  const [features, setFeatures] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheLoaded = useRef(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    if (!cacheLoaded.current) {
      const cachedFeatures = getCachedFeatures(cachePolicy);
      if (cachedFeatures.length > 0) {
        setFeatures(new Set(cachedFeatures));
      }
      cacheLoaded.current = true;
    }

    fetch(FEATURES_URL, {
      method: 'post',
      headers: { 'Client-Key': clientKey },
      body: serializeBody({ user, team }),
    })
      .then((response) => response.json())
      .then((data: { features: string[] }) => {
        if (!isCancelled) {
          setFeatures(new Set(data.features));
          setCachedFeatures(data.features, cachePolicy);
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
