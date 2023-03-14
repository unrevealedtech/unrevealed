import { execa } from 'execa';
import fs from 'fs-extra';
import { ClientError, gql, GraphQLClient } from 'graphql-request';
import inquirer from 'inquirer';
import path from 'path';
import { readToken } from '~/auth';
import { API_URL } from '~/constants';
import { logError, logSuccess, logUnauthorized } from '~/logger';

const PRODUCTS_QUERY = gql`
  query Products {
    products {
      id
      name
      organization {
        id
        name
      }
    }
  }
`;

type ProductsQuery = {
  products: Array<{
    id: string;
    name: string;
    organization: {
      id: string;
      name: string;
    };
  }>;
};

export async function init() {
  const token = await readToken();

  if (!token) {
    logUnauthorized();
    return;
  }

  const graphqlClient = new GraphQLClient(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const { products } = await graphqlClient.request<ProductsQuery>(
      PRODUCTS_QUERY,
    );

    if (products.length === 0) {
      logError('Could not find any product');
      return;
    }

    const { productId, sdk, generatedFilename } = await inquirer.prompt<{
      productId: string;
      sdk: 'react';
      generatedFilename: string;
    }>([
      {
        name: 'productId',
        type: 'list',
        message: 'Which product do you want to link?',
        choices: products.map((product) => ({
          name: `${product.name} (${product.organization.name})`,
          value: product.id,
        })),
      },
      {
        name: 'sdk',
        type: 'list',
        message: 'Which SDK would you like to use for this project?',
        choices: [
          {
            name: 'React',
            value: 'react',
          },
          {
            name: 'Node.js',
            value: 'node',
          },
        ],
      },
      {
        name: 'generatedFilename',
        type: 'input',
        message: 'Where do you the code to be generated?',
        default: path.join('src', 'generated', 'unrevealed.ts'),
      },
    ]);

    await writeConfig({ productId, sdk, generatedFilename });

    logSuccess('Created unrevealed.config.json');
  } catch (err) {
    if (err instanceof ClientError) {
      if (
        err.response.errors?.some((error) => error.message === 'Unauthorized')
      ) {
        logUnauthorized();
        return;
      }
    }
  }
}

async function writeConfig({
  sdk,
  productId,
  generatedFilename,
}: {
  sdk: 'react';
  productId: string;
  generatedFilename: string;
}) {
  const { stdout: projectDir } = await execa('npm', ['prefix']);

  const configFile = path.join(projectDir, 'unrevealed.config.json');
  await fs.writeJSON(
    configFile,
    {
      productId,
      generates: {
        [generatedFilename]: {
          sdk,
        },
      },
    },
    { spaces: 2 },
  );
}
