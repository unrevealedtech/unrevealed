import { useCallback, useContext, useMemo } from 'react';
import { UnrevealedContext } from './context';
import { FeatureKey } from './types';

export function useFeatures(): {
  allFeatures: Array<{ key: FeatureKey; enabled: boolean }>;
  activeFeatures: FeatureKey[];
  toggleFeature: (feature: FeatureKey) => void;
} {
  const {
    allFeatures: allFeatureKeys,
    filteredFeatures,
    setFilteredFeatures,
  } = useContext(UnrevealedContext);

  const allFeatures = useMemo(
    () =>
      [...allFeatureKeys].map((feature) => ({
        key: feature,
        enabled: !filteredFeatures.has(feature),
      })),
    [allFeatureKeys, filteredFeatures],
  );

  const activeFeatures = useMemo(
    () => allFeatures.filter(({ enabled }) => enabled).map(({ key }) => key),
    [allFeatures],
  );

  const toggleFeature = useCallback(
    (feature: FeatureKey) => {
      if (filteredFeatures.has(feature)) {
        setFilteredFeatures(
          (prev) => new Set([...prev].filter((f) => feature !== f)),
        );
      } else {
        setFilteredFeatures((prev) => new Set([...prev, feature]));
      }
    },
    [filteredFeatures, setFilteredFeatures],
  );

  return {
    allFeatures,
    activeFeatures,
    toggleFeature,
  };
}
