import { InjectionKey, Ref } from 'vue';

export const featuresInjectionKey: InjectionKey<Ref<Set<string>>> =
  Symbol('features');

export const apiKeyInjectionKey: InjectionKey<string> = Symbol('apiKey');
