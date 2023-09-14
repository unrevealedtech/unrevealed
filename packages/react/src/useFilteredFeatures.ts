import { useCallback, useContext, useMemo } from 'react';
import { UnrevealedContext } from './context';

export function useFilteredFeatures() {
  const { allFeatures, filteredFeatures, setFilteredFeatures } =
    useContext(UnrevealedContext);

  return {
    allFeatures: useMemo(() => [...allFeatures], [allFeatures]),
    filteredFeatures: useMemo(() => [...filteredFeatures], [filteredFeatures]),
    setFilteredFeatures: useCallback(
      (features: string[]) => setFilteredFeatures(new Set(features)),
      [setFilteredFeatures],
    ),
  };
}
