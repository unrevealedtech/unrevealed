export interface UserTraits {}

export interface User {
  id: string;
  traits?: keyof UserTraits extends never
    ? Record<string, unknown>
    : UserTraits;
}

export interface TeamTraits {}

export interface Team {
  id: string;
  traits?: keyof TeamTraits extends never
    ? Record<string, unknown>
    : TeamTraits;
}

export interface Features {}

export type FeatureKey = keyof Features extends never ? string : keyof Features;

export interface Stages {}

export type StageKey = keyof Stages extends never ? string : keyof Stages;

export interface FeatureAccess {
  fullAccess: boolean;
  userAccess: string[];
  teamAccess: string[];
  userPercentageAccess: number;
  teamPercentageAccess: number;
}
