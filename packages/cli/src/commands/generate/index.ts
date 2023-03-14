import chalk from 'chalk';
import { z } from 'zod';

import { findUp } from 'find-up';
import fs from 'fs-extra';
import { fromZodError } from 'zod-validation-error';
import { readToken } from '~/auth';
import { logError, logUnauthorized } from '~/logger';
import { generatorReact } from './generators/react';
import { fetchProduct, Query } from './graphql';

type Sdk = 'react' | 'node';

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

  const config = await readConfig(configFile);
  if (!config) {
    return;
  }

  const { productId, generates } = config;

  const product = await fetchProduct(productId, token);
  if (!product) {
    return;
  }

  const generateItems = Object.entries(generates);

  for (const [filename, { sdk }] of generateItems) {
    const generate = generators[sdk];

    const code = generate(product);

    try {
      await fs.writeFile(filename, code);
    } catch (err) {
      let message = `Error writing to file: ${filename}`;
      if (err instanceof Error) {
        message = `${message}\n${err.message}`;
      }
      logError(message);
    }
  }
}

const generators: Record<Sdk, (product: Query['product']) => string> = {
  react: generatorReact,
  node: () => '',
};

const configSchema = z.object({
  productId: z.string(),
  generates: z.record(
    z.string(),
    z.object({
      sdk: z.union([z.literal('react'), z.literal('node')]),
    }),
  ),
});

async function readConfig(configFile: string) {
  try {
    const config: unknown = await fs.readJSON(configFile);

    const parseRes = configSchema.safeParse(config);
    if (!parseRes.success) {
      const errorMessage = fromZodError(parseRes.error).message;
      logError(`Error parsing ${configFile}\n\n>>> ${errorMessage}`);
      return null;
    }

    return parseRes.data;
  } catch (err) {
    logError(`Error parsing ${configFile}`);

    return null;
  }
}
