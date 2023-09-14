import { createContext } from 'react';
import { TRACKING_URL } from './constants';
import { FeatureKey, Team, User } from './types';

export interface UnrevealedContextValue {
  clientKey: string;
  allFeatures: Set<FeatureKey>;
  activeFeatures: Set<FeatureKey>;
  loading: boolean;
  error: string | null;
  filteredFeatures: Set<FeatureKey>;
  setFilteredFeatures: React.Dispatch<React.SetStateAction<Set<FeatureKey>>>;
  trackingUrl: string;
  setUser: (user: User | null) => void;
  setTeam: (user: Team | null) => void;
}

export const UnrevealedContext = createContext<UnrevealedContextValue>({
  clientKey: '',
  allFeatures: new Set(),
  activeFeatures: new Set(),
  loading: true,
  error: null,
  filteredFeatures: new Set(),
  setFilteredFeatures: () => [],
  trackingUrl: TRACKING_URL,
  setUser: () => {},
  setTeam: () => {},
});
