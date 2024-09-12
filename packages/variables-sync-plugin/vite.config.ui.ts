import { defineConfig } from "vite";
import path from "node:path";
import { viteSingleFile } from "vite-plugin-singlefile";
import react from '@vitejs/plugin-react-swc';
// import richSvg from "vite-plugin-react-rich-svg";
import postcssUrl from "postcss-url";

// import figmaManifest from './figma.manifest';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(),/* richSvg()*/, viteSingleFile()],
  root: path.resolve("src/ui"),
  build: {
    minify: mode === "production",
    cssMinify: mode === "production",
    sourcemap: mode !== "production" ? "inline" : false,
    emptyOutDir: false,
    outDir: path.resolve("dist"),
    rollupOptions: {
      input: path.resolve("src/ui/index.html"),
    },
  },
  css: {
    postcss: {
      plugins: [postcssUrl({ url: "inline" })],
    },
  },
  resolve: {
    alias: {
      "@common": path.resolve("src/common"),
      "@ui": path.resolve("src/ui"),
    },
  },
}));
