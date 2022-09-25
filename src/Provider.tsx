import React, { useEffect, useState } from 'react';
import { UnrevealedContext } from './context';

export interface UnrevealedProviderProps {
  clientKey: string;
  children: React.ReactNode;
}

export function UnrevealedProvider({
  clientKey,
  children,
}: UnrevealedProviderProps) {
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://edge.unrevealed.tech', {
      method: 'get',
      headers: { 'Client-Key': clientKey },
    })
      .then((response) => response.json())
      .then((data) => {
        setFeatures(data.features);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);

        setError(err);
      });
  }, [clientKey]);

  return (
    <UnrevealedContext.Provider value={{ features, loading, error }}>
      {children}
    </UnrevealedContext.Provider>
  );
}
