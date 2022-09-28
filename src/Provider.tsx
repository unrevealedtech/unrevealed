import React from 'react';
import { UnrevealedContext } from './context';
import { User } from './types';
import { useFetchFeatureFlags } from './useFetchFeatureFlags';
import { useTrackUser } from './useTrackUser';

export interface UnrevealedProviderProps {
  clientKey: string;
  children: React.ReactNode;
  user?: User | undefined | null;
  wait?: boolean;
}

export function UnrevealedProvider({
  clientKey,
  user,
  children,
  wait,
}: UnrevealedProviderProps) {
  const { features, loading, error } = useFetchFeatureFlags(clientKey, user, {
    wait: !!wait,
  });
  useTrackUser(clientKey, user, { wait: !!wait });

  return (
    <UnrevealedContext.Provider value={{ features, loading, error }}>
      {children}
    </UnrevealedContext.Provider>
  );
}
