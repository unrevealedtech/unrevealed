import chalk from 'chalk';
import { z } from 'zod';

import { findUp } from 'find-up';
import fs from 'fs-extra';
import path from 'path';
import { fromZodError } from 'zod-validation-error';
import { readToken } from '~/auth';
import { logError, logSuccess, logUnauthorized } from '~/logger';
import { generator } from './generators/generator';

import { fetchProduct } from './graphql';
import { SDKS } from './types';

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
    const generate = generator(SDKS[sdk]);
    const code = generate(product);

    try {
      await fs.ensureDir(path.dirname(filename));
      await fs.writeFile(filename, code);

      logSuccess(`Generated types and flags at ${filename}`);
    } catch (err) {
      let message = `Error writing to file: ${filename}`;
      if (err instanceof Error) {
        message = `${message}\n${err.message}`;
      }
      logError(message);
    }
  }
}

const configSchema = z.object({
  productId: z.string(),
  generates: z.record(
    z.string(),
    z.object({
      sdk: z.union([
        z.literal('react'),
        z.literal('node'),
        z.literal('vue'),
        z.literal('js'),
        z.literal('serverless'),
      ]),
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
