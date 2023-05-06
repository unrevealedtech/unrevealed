import { Plugin, ref } from 'vue';
import { apiKeyInjectionKey, featuresInjectionKey } from './injectionKeys';
import { FeatureKey } from './types';

export interface UnrevealedPluginOptions {
  clientKey: string;
}

export const UnrevealedPlugin: Plugin<UnrevealedPluginOptions[]> = {
  install(app, { clientKey }) {
    const features = ref<Set<FeatureKey>>(new Set());

    app.provide(featuresInjectionKey, features);
    app.provide(apiKeyInjectionKey, clientKey);
  },
};
