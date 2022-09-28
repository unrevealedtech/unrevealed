import { useEffect, useState } from 'react';
import { User } from './types';

export function useFetchFeatureFlags(
  clientKey: string,
  user: User | undefined | null,
  { wait }: { wait: boolean },
) {
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wait) {
      return;
    }

    fetch('https://edge.unrevealed.tech', {
      method: 'get',
      headers: { 'Client-Key': clientKey },
    })
      .then((response) => response.json())
      .then((data) => {
        setFeatures(data.features);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [clientKey, user, wait]);

  return { features, loading, error };
}
