import React, { useMemo, useState } from 'react';

import { TRACKING_URL } from './constants';
import { UnrevealedContext } from './context';
import { FeatureKey, Team, User } from './types';
import { useFetchFeatures } from './useFetchFeatures';

export interface UnrevealedProviderProps {
  clientKey: string;
  children: React.ReactNode;
  cachePolicy?: 'localStorage' | 'none';
  defaults?: Partial<Record<FeatureKey, boolean>>;
}

interface AdditionalProps {
  trackingUrl?: string | undefined;
}

export function UnrevealedProvider({
  clientKey,
  children,
  cachePolicy = 'none',
  defaults = {},
  ...props
}: UnrevealedProviderProps) {
  const { trackingUrl } = props as AdditionalProps;
  const [filteredFeatures, setFilteredFeatures] = useState<Set<string>>(
    new Set(),
  );

  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const [fetchIndex, setFetchIndex] = useState(0);
  const {
    features: allFeatures,
    loading,
    error,
  } = useFetchFeatures({
    clientKey,
    user,
    team,
    cachePolicy,
    fetchIndex,
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
        defaults,
        fetchIndex,
        setFetchIndex,
      }}
    >
      {children}
    </UnrevealedContext.Provider>
  );
}
