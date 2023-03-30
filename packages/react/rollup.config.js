import typescript from '@rollup/plugin-typescript';
import css from 'rollup-plugin-import-css';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/main.ts',
  external: ['react'],
  output: {
    dir: 'dist',
    format: 'cjs',
    sourcemap: true,
  },
  plugins: [typescript(), css()],
};
