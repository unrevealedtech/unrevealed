import { useContext } from 'react';
import { UnrevealedContext } from './context';

export interface UseFeatureResult {
  isEnabled: boolean;
  loading: boolean;
  error: string | null;
}

export function useFeature(featureKey: string) {
  const { error, loading, features } = useContext(UnrevealedContext);

  return {
    isEnabled: features.includes(featureKey),
    loading,
    error,
  };
}
