import { createContext } from 'react';

export interface UnrevealedContextValue {
  allFeatures: string[];
  activeFeatures: string[];
  loading: boolean;
  error: string | null;
  filteredFeatures: string[];
  setFilteredFeatures: (features: string[]) => void;
}

export const UnrevealedContext = createContext<UnrevealedContextValue>({
  allFeatures: [],
  activeFeatures: [],
  loading: true,
  error: null,
  filteredFeatures: [],
  setFilteredFeatures: () => [],
});
