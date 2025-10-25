import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

export default defineConfig(() => {
  // Dynamically read benchmark test files
  const testsPath = path.resolve(__dirname, 'benchmark/tests');
  const files = fs.existsSync(testsPath) ? fs.readdirSync(testsPath) : [];
  
  const entryPoints: Record<string, string> = {};
  files.forEach((file) => {
    if (file.endsWith('.ts')) {
      const fileName = file.replace('.ts', '');
      entryPoints[fileName] = path.resolve(testsPath, file);
    }
  });
  
  return {
    build: {
      outDir: 'benchmark/build/tests',
      sourcemap: true,
      minify: false,
      target: 'es2020',
      emptyOutDir: true,
      
      lib: {
        entry: entryPoints,
        formats: ['cjs'],
        fileName: (format, name) => `${name}.js`,
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
      'process.env.NODE_ENV': JSON.stringify('development'),
    },
  };
});
