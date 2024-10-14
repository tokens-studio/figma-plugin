import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/**/*.ts', "!src/**/__tests__/**", "!src/**/*.test.*"],
  // entry: ['src/**/*.ts'],
  dts: true,
  bundle: true,
  splitting: true,
  sourcemap: true,
  format: ['esm', 'cjs'],
  skipNodeModulesBundle: true,
  clean: true,
});
