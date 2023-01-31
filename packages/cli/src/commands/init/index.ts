import chalk from 'chalk';
import { execa } from 'execa';
import fs from 'fs-extra';
import { ClientError, gql, GraphQLClient } from 'graphql-request';
import inquirer from 'inquirer';
import path from 'path';
import { readToken } from '~/auth';

const BASE_API_URL = process.env.BASE_API_URL ?? 'https://api.unrevealed.tech';
const API_URL = `${BASE_API_URL}/graphql`;

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

export async function link() {
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

    const { productId, client, generatedFile } = await inquirer.prompt<{
      productId: string;
      client: 'react';
      generatedFile: string;
    }>([
      {
        name: 'productId',
        type: 'list',
        message: 'Which project do you want to link?',
        choices: products.map((product) => ({
          name: `${product.name} (${product.organization.name})`,
          value: product.id,
        })),
      },
      {
        name: 'client',
        type: 'list',
        message: 'Which SDK would you like to use for this project?',
        choices: [
          {
            name: 'React',
            value: 'react',
          },
        ],
      },
      {
        name: 'generatedFile',
        type: 'input',
        default: path.join('src', 'generated', 'unrevealed.ts'),
      },
    ]);

    await writeConfig({ productId, client, generatedFile });

    console.log(chalk.green('>>> Created unrevealed.config.json'));
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

function logUnauthorized() {
  logError(
    chalk.red('User not found. Please login to Unrevealed first by running'),
    chalk.red.bold('`unrev login`'),
  );
}

function logError(...texts: string[]) {
  console.log(
    chalk.bgRed.white.bold(' ERROR '),
    ...texts.map((text) => chalk.red(text)),
  );
}

async function writeConfig({
  productId,
  generatedFile,
  client,
}: {
  productId: string;
  generatedFile: string;
  client: 'react';
}) {
  const { stdout: projectDir } = await execa('npm', ['prefix']);

  const configFile = path.join(projectDir, 'unrevealed.config.json');
  await fs.writeJSON(
    configFile,
    {
      productId,
      generate: generatedFile,
      client,
    },
    { spaces: 2 },
  );
}
