import { useContext } from 'react';
import { UnrevealedContext } from './context';
import { FeatureKey } from './types';

export interface UseFeatureResult {
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

export function useFeature(featureKey: FeatureKey) {
  const { error, loading, activeFeatures } = useContext(UnrevealedContext);

  return {
    enabled: activeFeatures.has(featureKey),
    loading,
    error,
  };
}
