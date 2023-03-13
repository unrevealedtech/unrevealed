export interface User {
  id: string;
  traits: Record<string, unknown>;
}

export interface Team {
  id: string;
  traits: Record<string, unknown>;
}

export interface UnrevealedFeatures {}

export type UnrevealedFeatureKey = keyof UnrevealedFeatures extends never
  ? string
  : keyof UnrevealedFeatures;
