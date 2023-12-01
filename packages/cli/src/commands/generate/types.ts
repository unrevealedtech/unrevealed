export const SDKS = {
  react: '@unrevealed/react',
  node: '@unrevealed/node',
  vue: '@unrevealed/vue',
  js: '@unrevealed/js',
  serverless: '@unrevealed/serverless',
} as const;

export type Sdk = keyof typeof SDKS;

export type PackageName = (typeof SDKS)[Sdk];
