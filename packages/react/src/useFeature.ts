import { useContext } from 'react';
import { UnrevealedContext } from './context';
import { UnrevealedFeatureKey } from './types';

export interface UseFeatureResult {
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

export function useFeature(featureKey: UnrevealedFeatureKey) {
  const { error, loading, activeFeatures } = useContext(UnrevealedContext);

  return {
    enabled: activeFeatures.has(featureKey),
    loading,
    error,
  };
}
