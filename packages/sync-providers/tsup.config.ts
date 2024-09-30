import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts'],
  // entry: ['src/**/*.ts'],
  dts: true,
  bundle: true,
  splitting: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  skipNodeModulesBundle: true,
  clean: true,
});
