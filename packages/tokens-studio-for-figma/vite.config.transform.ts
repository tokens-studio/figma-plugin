import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    build: {
      outDir: 'token-transformer/dist',
      sourcemap: false,
      minify: isProduction,
      target: 'es2020',
      lib: {
        entry: path.resolve(__dirname, 'src/utils/transform.ts'),
        name: 'tokenTransformer',
        formats: ['cjs'],
        fileName: () => 'transform.js',
      },
      rollupOptions: {
        external: [],
        output: {
          exports: 'default',
        },
      },
    },
    
    resolve: {
      alias: {
        Types: path.resolve(__dirname, 'types'),
        '@types': path.resolve(__dirname, 'types'),
        '@': path.resolve(__dirname, 'src'),
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});
