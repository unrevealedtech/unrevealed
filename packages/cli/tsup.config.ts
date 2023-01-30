import { defineConfig, Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/cli.ts'],
  format: ['cjs'],
  clean: true,
  noExternal: ['chalk', 'ora', 'inquirer', 'execa'],
  ...options,
}));
