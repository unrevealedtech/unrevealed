import { useCallback, useContext, useMemo } from 'react';
import { UnrevealedContext } from './context';
import { FeatureKey } from './types';

export function useFeatures() {
  const {
    allFeatures: allFeatureKeys,
    filteredFeatures,
    setFilteredFeatures,
  } = useContext(UnrevealedContext);

  const allFeatures: Array<{ key: FeatureKey; enabled: boolean }> = useMemo(
    () =>
      [...allFeatureKeys].map((feature) => ({
        key: feature,
        enabled: filteredFeatures.has(feature),
      })),
    [allFeatureKeys],
  );

  const activeFeatures: FeatureKey[] = useMemo(
    () => [...filteredFeatures],
    [filteredFeatures],
  );

  const setActiveFeatures: (features: FeatureKey[]) => void = useCallback(
    (features: FeatureKey[]) => setFilteredFeatures(new Set(features)),
    [setFilteredFeatures],
  );

  const toggleFeature: (feature: FeatureKey) => void = useCallback(
    (feature: FeatureKey) => {
      if (filteredFeatures.has(feature)) {
        setFilteredFeatures(
          (prev) => new Set([...prev].filter((f) => feature !== f)),
        );
      } else {
        setFilteredFeatures((prev) => new Set([...prev, feature]));
      }
    },
    [setFilteredFeatures],
  );

  return {
    allFeatures,
    activeFeatures,
    setActiveFeatures,
    toggleFeature,
  };
}
