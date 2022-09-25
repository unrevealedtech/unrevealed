import { useContext } from 'react';
import { UnrevealedContext } from './context';

export function useFeature(featureKey: string) {
  const { error, loading, features } = useContext(UnrevealedContext);

  return {
    active: features.includes(featureKey),
    loading,
    error,
  };
}
