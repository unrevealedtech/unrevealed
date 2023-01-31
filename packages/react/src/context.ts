import { createContext } from 'react';
import { TRACKING_URL } from './constants';
import { Team, User } from './types';

export interface UnrevealedContextValue {
  clientKey: string;
  allFeatures: Set<string>;
  activeFeatures: Set<string>;
  loading: boolean;
  error: string | null;
  filteredFeatures: Set<string>;
  setFilteredFeatures: (features: Set<string>) => void;
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
