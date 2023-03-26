import { DATA_TYPE_MAP } from '../dataType';
import { Query } from '../graphql';

export function indent(code: string, indent: number) {
  return code
    .split(`\n`)
    .map((line) => `${' '.repeat(indent)}${line}`)
    .join('\n');
}

export function formatObjectKey(key: string) {
  if (/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(key)) {
    return key;
  }
  return `'${key}'`;
}

export function generateUnrevealedFeaturesInterface(
  features: Query['product']['features'],
) {
  return `interface Features {
${features
  .map((feature) => `  ${formatObjectKey(feature.key)}: boolean;`)
  .join(`\n`)}
}`;
}

export function generateUserTraitsInterface(
  traits: Query['product']['userTraits'],
) {
  return `interface UserTraits {
${traits
  .map(
    (trait) =>
      `  ${formatObjectKey(trait.name)}: ${
        DATA_TYPE_MAP[trait.dataType]
      } | null;`,
  )
  .join(`\n`)}
}`;
}

export function generateTeamTraitsInterface(
  traits: Query['product']['teamTraits'],
) {
  return `interface TeamTraits {
${traits
  .map(
    (trait) =>
      `  ${formatObjectKey(trait.name)}: ${
        DATA_TYPE_MAP[trait.dataType]
      } | null;`,
  )
  .join(`\n`)}
}`;
}

export function generateFeatureInterface() {
  return `export interface Feature {
  name: string;
  description: string;
}`;
}

export function generateFeatures(features: Query['product']['features']) {
  return `export const features: Record<FeatureKey, Feature> = {
${features
  .map(
    (feature) => `  ${formatObjectKey(feature.key)}: {
    name: ${JSON.stringify(feature.name)},
    description: ${JSON.stringify(feature.description)},
  },`,
  )
  .join('\n')}
};`;
}

export function generateFeatureKeys(features: Query['product']['features']) {
  return `export const featureKeys: FeatureKey[] = [
${features.map((feature) => `  '${feature.key}',`).join('\n')}
];`;
}
