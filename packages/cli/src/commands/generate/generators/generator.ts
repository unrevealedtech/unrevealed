import { Query } from '../graphql';
import {
  generateFeatureInterface,
  generateFeatureKeys,
  generateFeatures,
  generateTeamTraitsInterface,
  generateUnrevealedFeaturesInterface,
  generateUserTraitsInterface,
  indent,
} from './utils';

export function generator(packageName: string) {
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

    return `import type { FeatureKey } from '${packageName}';
  
declare module '${packageName}' {
${indent(generateUnrevealedFeaturesInterface(sortedFeatures), 2)}

${indent(generateUserTraitsInterface(product.userTraits), 2)}

${indent(generateTeamTraitsInterface(product.teamTraits), 2)}
}
  
${generateFeatureInterface()}

${generateFeatures(sortedFeatures)}

${generateFeatureKeys(sortedFeatures)}
`;
  };
}
