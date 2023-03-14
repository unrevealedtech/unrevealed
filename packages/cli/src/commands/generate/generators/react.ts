import { DATA_TYPE_MAP } from '../dataType';
import { Query } from '../graphql';
import { formatObjectKey, indent } from './utils';

export function generatorReact(product: Query['product']) {
  const sortedFeatures = product.features.sort((featureA, featureB) => {
    if (featureA.key < featureB.key) {
      return -1;
    }
    if (featureA.key > featureB.key) {
      return 1;
    }
    return 0;
  });

  return `import { UnrevealedFeatureKey } from '@unrevealed/react';

declare module '@unrevealed/react' {
${indent(generateUnrevealedFeaturesInterface(sortedFeatures), 2)}

${indent(generateUserTraitsInterface(product.userTraits), 2)}

${indent(generateTeamTraitsInterface(product.teamTraits), 2)}
}

${generateFeatureKeys(sortedFeatures)}
`;
}

function generateUnrevealedFeaturesInterface(
  features: Query['product']['features'],
) {
  return `interface UnrevealedFeatures {
${features
  .map((feature) => `  ${formatObjectKey(feature.key)}: boolean;`)
  .join(`\n`)}
}`;
}

function generateUserTraitsInterface(traits: Query['product']['userTraits']) {
  return `interface UserTraits {
${traits
  .map(
    (trait) =>
      `  ${formatObjectKey(trait.name)}: ${DATA_TYPE_MAP[trait.dataType]};`,
  )
  .join(`\n`)}
}`;
}

function generateTeamTraitsInterface(traits: Query['product']['teamTraits']) {
  return `interface TeamTraits {
${traits
  .map(
    (trait) =>
      `  ${formatObjectKey(trait.name)}: ${DATA_TYPE_MAP[trait.dataType]};`,
  )
  .join(`\n`)}
}`;
}

function generateFeatureKeys(features: Query['product']['features']) {
  return `export const featureKeys: UnrevealedFeatureKey[] = [
${features.map((feature) => `  '${feature.key}',`).join('\n')}
];`;
}
