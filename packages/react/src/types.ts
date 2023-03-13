export interface UserTraits {}

export interface User {
  id: string;
  traits: keyof UserTraits extends never ? Record<string, unknown> : UserTraits;
}

export interface TeamTraits {}

export interface Team {
  id: string;
  traits: keyof TeamTraits extends never ? Record<string, unknown> : TeamTraits;
}

export interface UnrevealedFeatures {}

export type UnrevealedFeatureKey = keyof UnrevealedFeatures extends never
  ? string
  : keyof UnrevealedFeatures;
