import { useContext } from 'react';
import { UnrevealedContext } from './context';
import { useIdentify } from './useIdentify';

export function useUnrevealed() {
  const context = useContext(UnrevealedContext);
  const { identify } = useIdentify();

  return {
    features: context.activeFeatures,
    loading: context.loading,
    error: context.error,
    identify,
  };
}
