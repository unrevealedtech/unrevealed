import { Query } from '../graphql';
import { PackageName } from '../types';
import {
  generateFeatureInterface,
  generateFeatureKeys,
  generateFeatures,
  generateStageInterface,
  generateStageKeys,
  generateStages,
  generateTeamTraitsInterface,
  generateUnrevealedFeaturesInterface,
  generateUnrevealedStagesInterface,
  generateUserTraitsInterface,
  indent,
} from './utils';

const SERVERSIDE_PACKAGES: PackageName[] = [
  '@unrevealed/node',
  '@unrevealed/serverless',
];

export function generator(packageName: PackageName) {
  return (product: Query['product']) => {
    const sortedFeatures = product.features.sort((featureA, featureB) => {
      if (featureA.key < featureB.key) {
        return -1;
      }
      if (featureA.key > featureB.key) {
        return 1;
      }
      return 0;
    });

    const sortedStages = product.featureStages.sort((stageA, stageB) => {
      if (stageA.position < stageB.position) {
        return -1;
      }
      if (stageA.position > stageB.position) {
        return 1;
      }
      return 0;
    });

    const isServerSide = SERVERSIDE_PACKAGES.includes(packageName);

    return `import type { FeatureKey${
      isServerSide ? `, StageKey` : ''
    } } from '${packageName}';

declare module '${packageName}' {
${indent(generateUnrevealedFeaturesInterface(sortedFeatures), 2)}
${
  isServerSide
    ? `\n${indent(generateUnrevealedStagesInterface(sortedStages), 2)}\n`
    : ''
}
${indent(generateUserTraitsInterface(product.userTraits), 2)}

${indent(generateTeamTraitsInterface(product.teamTraits), 2)}
}

${generateFeatureInterface()}

${generateFeatures(sortedFeatures)}

${generateFeatureKeys(sortedFeatures)}${
      isServerSide
        ? `
        
${generateStageInterface()}

${generateStages(sortedStages)}

${generateStageKeys(sortedStages)}`
        : ''
    }
`;
  };
}
