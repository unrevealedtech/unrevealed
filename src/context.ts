import { createContext } from 'react';
import { TRACKING_URL } from './constants';
import { Team, User } from './types';

export interface UnrevealedContextValue {
  clientKey: string;
  allFeatures: string[];
  activeFeatures: string[];
  loading: boolean;
  error: string | null;
  filteredFeatures: string[];
  setFilteredFeatures: (features: string[]) => void;
  trackingUrl: string;
  setUser: (user: User | null) => void;
  setTeam: (user: Team | null) => void;
}

export const UnrevealedContext = createContext<UnrevealedContextValue>({
  clientKey: '',
  allFeatures: [],
  activeFeatures: [],
  loading: true,
  error: null,
  filteredFeatures: [],
  setFilteredFeatures: () => [],
  trackingUrl: TRACKING_URL,
  setUser: () => {},
  setTeam: () => {},
});
