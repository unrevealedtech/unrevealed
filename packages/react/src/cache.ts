const CACHE_KEY = 'unrevealed:features';

export type CachePolicy = 'localStorage' | 'none';

export function getCachedFeatures(cachePolicy: CachePolicy): string[] {
  if (cachePolicy === 'none') {
    return [];
  }
  if (cachePolicy === 'localStorage') {
    try {
      const features: unknown = JSON.parse(
        localStorage.getItem(CACHE_KEY) ?? '[]',
      );

      if (isCacheValid(features)) {
        return features;
      }
      return [];
    } catch (err) {
      return [];
    }
  }
  return [];
}

export function setCachedFeatures(
  features: string[],
  cachePolicy: CachePolicy,
) {
  if (cachePolicy === 'localStorage') {
    try {
      localStorage.set(CACHE_KEY, JSON.stringify(features));
    } catch (err) {
      return;
    }
  }
}

function isCacheValid(cachedFeatures: unknown): cachedFeatures is string[] {
  return (
    Array.isArray(cachedFeatures) &&
    cachedFeatures.every((feature) => typeof feature === 'string')
  );
}
