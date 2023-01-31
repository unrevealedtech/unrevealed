import chalk from 'chalk';
import { findUp } from 'find-up';
import fs from 'fs-extra';
import { gql, GraphQLClient } from 'graphql-request';
import { IndentationText, Project, WriterFunction, Writers } from 'ts-morph';
import { readToken } from '~/auth';
import { API_URL } from '~/constants';
import { logError, logUnauthorized } from '~/logger';

const FEATURES_QUERY = gql`
  query Features($productId: ID!) {
    product(productId: $productId) {
      id
      features {
        id
        key
      }
    }
  }
`;

type FeaturesQuery = {
  product: {
    id: string;
    features: Array<{
      id: string;
      key: string;
    }>;
  };
};

export async function generate() {
  const token = await readToken();

  if (!token) {
    logUnauthorized();
    return;
  }

  const configFile = await findUp('unrevealed.config.json');
  if (!configFile) {
    logError(
      'Config file not found. Run',
      chalk.bold('`unrev init`'),
      'to generate it',
    );
    return;
  }

  const { productId, generate: generatedFile } = await fs.readJSON(configFile);

  const graphqlClient = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { product } = await graphqlClient.request<FeaturesQuery>(
    FEATURES_QUERY,
    { productId },
  );

  const { features } = product;

  const project = new Project({
    manipulationSettings: {
      indentationText: IndentationText.TwoSpaces,
    },
  });

  const source = project.createSourceFile(generatedFile, '', {
    overwrite: true,
  });

  source.addImportDeclaration({
    moduleSpecifier: '@unrevealed/react',
    namedImports: ['useUnrevealed'],
  });

  const featureKeys = features.map((feature) => `'${feature.key}'`);

  let featureType: string | WriterFunction = 'never';
  if (featureKeys.length == 1) {
    featureType = featureKeys[0];
  } else if (featureKeys.length > 1) {
    const [feature1, feature2, ...restFeatures] = featureKeys;
    featureType = Writers.unionType(feature1, feature2, ...restFeatures);
  }

  source.addTypeAlias({
    name: 'FeatureKey',
    type: featureType,
    isExported: true,
  });

  const typedHookDeclaration = source.addFunction({
    name: 'useFeature',
    isExported: true,
    statements: `
      const { features, loading, error } = useUnrevealed();
      
      return {
        enabled: features.has(key),
        loading,
        error,
      };
    `,
  });

  typedHookDeclaration.addParameter({
    name: 'key',
    type: 'FeatureKey',
  });

  features.forEach((feature) => {
    source.addFunction({
      name: `use${feature.key
        .split('-')
        .map((word) => word.replace(/(^[a-z])/, (group) => group.toUpperCase()))
        .join('')}Feature`,
      isExported: true,
      statements: `return useFeature('${feature.key}');`,
    });
  });

  source.formatText();

  await source.save();
}
