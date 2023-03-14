export interface UnrevealedFeatures {}

export type UnrevealedFeatureKey = keyof UnrevealedFeatures extends never
  ? string
  : keyof UnrevealedFeatures;

export interface UnrevealedUserTraits {}

export interface User {
  id: string;
  traits: keyof UnrevealedUserTraits extends never
    ? Record<string, unknown>
    : UnrevealedUserTraits;
}

export interface UnrevealedTeamTraits {}

export interface Team {
  id: string;
  traits: keyof UnrevealedTeamTraits extends never
    ? Record<string, unknown>
    : UnrevealedTeamTraits;
}
