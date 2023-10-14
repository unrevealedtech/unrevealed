import React, { useMemo, useState } from 'react';

import { TRACKING_URL } from './constants';
import { UnrevealedContext } from './context';
import { Team, User } from './types';
import { useFetchFeatures } from './useFetchFeatures';

export interface UnrevealedProviderProps {
  clientKey: string;
  children: React.ReactNode;
  cachePolicy?: 'localStorage' | 'none';
}

interface AdditionalProps {
  trackingUrl?: string | undefined;
}

export function UnrevealedProvider({
  clientKey,
  children,
  cachePolicy = 'none',
  ...props
}: UnrevealedProviderProps) {
  const { trackingUrl } = props as AdditionalProps;
  const [filteredFeatures, setFilteredFeatures] = useState<Set<string>>(
    new Set(),
  );

  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const {
    features: allFeatures,
    loading,
    error,
  } = useFetchFeatures({
    clientKey,
    user,
    team,
    cachePolicy,
  });

  const activeFeatures = useMemo(() => {
    if (filteredFeatures.size === 0) {
      return allFeatures;
    }
    return new Set(
      [...allFeatures].filter((feature) => !filteredFeatures.has(feature)),
    );
  }, [filteredFeatures, allFeatures]);

  return (
    <UnrevealedContext.Provider
      value={{
        clientKey,
        allFeatures,
        activeFeatures,
        loading,
        error,
        filteredFeatures,
        setFilteredFeatures,
        trackingUrl: trackingUrl || TRACKING_URL,
        setUser,
        setTeam,
      }}
    >
      {children}
    </UnrevealedContext.Provider>
  );
}
