import { useContext } from 'react';
import { UnrevealedContext } from './context';

export function useFilteredFeatures() {
  const { allFeatures, filteredFeatures, setFilteredFeatures } =
    useContext(UnrevealedContext);

  return { allFeatures, filteredFeatures, setFilteredFeatures };
}
