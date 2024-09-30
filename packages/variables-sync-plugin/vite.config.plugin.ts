import path from "node:path";
import { defineConfig } from "vite";
import generateFile from "vite-plugin-generate-file";
import { viteSingleFile } from "vite-plugin-singlefile";

import figmaManifest from './figma.manifest';

export default defineConfig(({ mode }) => ({
  plugins: [
    viteSingleFile(),
    generateFile({
      type: "json",
      output: "./manifest.json",
      data: figmaManifest,
    }),
  ],
  build: {
    minify: mode === 'production',
    sourcemap: mode !== 'production' ? 'inline' : false,
    target: 'es2017',
    emptyOutDir: false,
    outDir: path.resolve("dist"),
    rollupOptions: {
      input: path.resolve('./src/plugin/bootloader.ts'),
      output: {
        entryFileNames: 'bootloader.js',
      },
    },
  },
  resolve: {
    alias: {
      "@common": path.resolve("./src/common"),
      "@plugin": path.resolve("./src/plugin"),
    },
  },
}));
