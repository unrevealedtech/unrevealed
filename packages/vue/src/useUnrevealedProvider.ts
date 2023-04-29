import { provide, ref } from 'vue';
import { apiKeyInjectionKey, featuresInjectionKey } from './injectionKeys';
import { FeatureKey } from './types';

export function useUnrevealedProvider(apiKey: string) {
  const features = ref<Set<FeatureKey>>(new Set());

  provide(featuresInjectionKey, features);
  provide(apiKeyInjectionKey, apiKey);
}
