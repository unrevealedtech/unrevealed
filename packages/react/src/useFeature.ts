import { useContext } from 'react';
import { UnrevealedContext } from './context';
import { FeatureKey } from './types';

export interface UseFeatureResult {
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

export function useFeature(featureKey: FeatureKey) {
  const { error, loading, activeFeatures, defaults } =
    useContext(UnrevealedContext);

  const enabled =
    activeFeatures.has(featureKey) ||
    (loading && defaults[featureKey] === true);

  const isFeatureLoading = loading && defaults[featureKey] !== undefined;

  return {
    loading: isFeatureLoading,
    enabled,
    error,
  };
}
