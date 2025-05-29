import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  return {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/utils/transform.ts'),
        name: 'tokenTransformer',
        fileName: 'transform',
        formats: ['cjs']
      },
      outDir: 'token-transformer/dist',
      sourcemap: false,
      minify: mode === 'production',
      target: 'node14',
      rollupOptions: {
        external: ['fs', 'path', 'util', 'crypto', 'stream', 'events']
      }
    },

    resolve: {
      alias: {
        'Types': resolve(__dirname, 'types'),
        '@types': resolve(__dirname, 'types'),
        '@': resolve(__dirname, 'src'),
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },

    optimizeDeps: {
      exclude: ['colorjs.io']
    },

    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    }
  }
})