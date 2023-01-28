import { useContext } from 'react';
import { UnrevealedContext } from './context';

export interface UseFeatureResult {
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

export function useFeature(featureKey: string) {
  const { error, loading, activeFeatures } = useContext(UnrevealedContext);

  return {
    enabled: activeFeatures.includes(featureKey),
    loading,
    error,
  };
}
