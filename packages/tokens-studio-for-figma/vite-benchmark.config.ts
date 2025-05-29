import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readdirSync } from 'fs'

export default defineConfig(() => {
  // Dynamically generate entry points from benchmark tests
  const testsPath = resolve(__dirname, 'benchmark/tests')
  const files = readdirSync(testsPath)
  const entryPoints: Record<string, string> = {}
  
  files.forEach((file) => {
    const fileName = file.replace('.ts', '')
    entryPoints[fileName] = resolve(testsPath, file)
  })

  return {
    build: {
      rollupOptions: {
        input: entryPoints,
        output: {
          entryFileNames: '[name].js',
          dir: 'benchmark/build/tests',
        }
      },
      sourcemap: true,
      target: 'es2020',
      emptyOutDir: true,
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
    }
  }
})