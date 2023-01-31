import { useContext } from 'react';
import { UnrevealedContext } from './context';

export interface UseFeatureResult {
  enabled: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * @deprecated
 */
export function useFeature(featureKey: string) {
  const { error, loading, activeFeatures } = useContext(UnrevealedContext);

  return {
    enabled: activeFeatures.has(featureKey),
    loading,
    error,
  };
}
