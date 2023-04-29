import { computed, inject } from 'vue';
import { featuresInjectionKey } from './injectionKeys';
import { FeatureKey } from './types';

export function useFeature(key: FeatureKey) {
  const features = inject(featuresInjectionKey);
  const feature = computed(() => {
    return { enabled: features?.value.has(key) ?? false };
  });

  return feature;
}
