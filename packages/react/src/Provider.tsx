import React, { useState } from 'react';

import { TRACKING_URL } from './constants';
import { UnrevealedContext } from './context';
import { Team, User } from './types';
import { useFetchFeatures } from './useFetchFeatures';

export interface UnrevealedProviderProps {
  clientKey: string;
  children: React.ReactNode;
  user?: User | undefined | null;
  team: Team | undefined | null;
  wait?: boolean;
}

interface AdditionalProps {
  trackingUrl?: string | undefined;
}

export function UnrevealedProvider({
  clientKey,
  children,
  ...props
}: UnrevealedProviderProps) {
  const { trackingUrl } = props as AdditionalProps;
  const [filteredFeatures, setFilteredFeatures] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  const { features, loading, error } = useFetchFeatures({
    clientKey,
    user,
    team,
  });

  const activeFeatures =
    filteredFeatures.length > 0
      ? features.filter((feature) => !filteredFeatures.includes(feature))
      : features;

  return (
    <UnrevealedContext.Provider
      value={{
        clientKey,
        allFeatures: features,
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
