# Webpack to Vite Migration Guide

This guide outlines the steps to migrate from Webpack to Vite for the Tokens Studio Figma Plugin.

## 1. Install Vite Dependencies

First, install the required Vite dependencies:

```bash
npm install --save-dev vite @vitejs/plugin-react-swc @sentry/vite-plugin rollup-plugin-visualizer
```

## 2. Update package.json Scripts

Replace the webpack-based scripts in `package.json`:

```json
{
  "scripts": {
    "build": "cross-env NODE_ENV=production vite build",
    "build:dev": "cross-env NODE_ENV=development vite build --mode development",
    "build:preview": "cross-env NODE_ENV=development PREVIEW_ENV=browser vite build --mode development",
    "build:cy": "cross-env LAUNCHDARKLY_FLAGS=tokenThemes,gitBranchSelector,multiFileSync,tokenFlowButton npm run build",
    "start": "cross-env vite build --mode development --watch",
    "preview:browser": "cross-env PREVIEW_ENV=browser vite dev",
    "build-transform": "vite build --config vite-transform.config.ts --mode production",
    "benchmark:build": "vite build --config vite-benchmark.config.ts"
  }
}
```

## 3. Main Vite Configuration (vite.config.ts)

Create `vite.config.ts` to replace `webpack.config.js`:

```typescript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { visualizer } from 'rollup-plugin-visualizer'

const packageJson = require('./package.json')

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDevServer = command === 'serve'
  const isProduction = mode === 'production'
  const isPreviewBrowser = process.env.PREVIEW_ENV === 'browser'

  return {
    plugins: [
      react({
        devTarget: isDevServer && isPreviewBrowser ? 'esnext' : undefined,
      }),
      
      // Sentry plugin for production builds
      ...(isProduction && env.SENTRY_AUTH_TOKEN ? [
        sentryVitePlugin({
          org: env.SENTRY_ORG,
          project: env.SENTRY_PROJECT,
          debug: true,
          authToken: env.SENTRY_AUTH_TOKEN,
          telemetry: false,
          sourcemaps: {
            filesToDeleteAfterUpload: ['dist/*.js.map', '*.js.map', 'ui.js']
          },
          release: {
            name: 'figma-tokens@' + packageJson.version,
            finalize: true,
            cleanArtifacts: true,
            deploy: {
              name: 'plugin@' + packageJson.version,
              env: env.ENVIRONMENT
            },
            setCommits: {
              auto: true,
              ignoreMissing: true,
            }
          },
        })
      ] : []),

      // Bundle analyzer
      ...(env.ANALYZE_BUNDLE ? [
        visualizer({
          filename: 'dist/stats.html',
          open: false,
          gzipSize: true,
          brotliSize: true,
        })
      ] : []),
    ],

    // Multiple entry points
    build: {
      rollupOptions: {
        input: {
          ui: resolve(__dirname, 'src/app/index.tsx'),
          code: resolve(__dirname, 'src/plugin/controller.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      },
      outDir: isPreviewBrowser && !isDevServer ? 'preview' : 'dist',
      sourcemap: isProduction ? true : 'inline',
      minify: isProduction,
      target: 'es2020',
      chunkSizeWarningLimit: 1000,
    },

    // Development server
    server: {
      port: 9000,
      open: false,
      hmr: isPreviewBrowser,
      overlay: false,
    },

    // Path resolution
    resolve: {
      alias: {
        'Types': resolve(__dirname, 'types'),
        '@types': resolve(__dirname, 'types'),
        '@': resolve(__dirname, 'src'),
        'react-redux': 'react-redux/dist/react-redux.js',
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },

    // Define global variables
    define: {
      'process.env.PREVIEW_ENV': JSON.stringify(env.PREVIEW_ENV),
      'process.env.LAUNCHDARKLY_FLAGS': JSON.stringify(env.LAUNCHDARKLY_FLAGS),
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis',
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'buffer',
        'process',
      ],
      exclude: [
        'colorjs.io'
      ]
    },

    // CSS handling
    css: {
      postcss: {
        plugins: [
          require('autoprefixer'),
        ]
      }
    },

    // Environment variables
    envDir: '.',
    envPrefix: ['VITE_', 'REACT_APP_'],

    // Worker handling
    worker: {
      format: 'es'
    }
  }
})
```

## 4. Transform Configuration (vite-transform.config.ts)

Create `vite-transform.config.ts` to replace `webpack-transform.config.js`:

```typescript
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
```

## 5. Benchmark Configuration (vite-benchmark.config.ts)

Create `vite-benchmark.config.ts` to replace `webpack-benchmark.config.js`:

```typescript
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
```

## 6. HTML Template Updates

Vite requires an `index.html` in the root. Move your HTML template and update it:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tokens Studio</title>
</head>
<body>
  <div id="react-page"></div>
  <script type="module" src="/src/app/index.tsx"></script>
</body>
</html>
```

## 7. Environment Variable Updates

Vite uses a different environment variable system. Update your `.env` files:

- Vite only exposes variables prefixed with `VITE_` to the client
- You may need to rename some environment variables
- Server-side variables are still accessible via `process.env`

## 8. Asset Handling Changes

Vite handles assets differently:

- SVG imports work with `@svgr/webpack` → use `vite-plugin-svgr` instead
- URL loader functionality is built-in
- Font handling is automatic

Install additional asset plugins if needed:

```bash
npm install --save-dev vite-plugin-svgr
```

Add to vite config:

```typescript
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr({
      include: "**/*.svg",
    }),
    // ... other plugins
  ]
})
```

## 9. TypeScript Configuration Updates

Update `tsconfig.json` to work better with Vite:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client", "jest"]
  }
}
```

## 10. Remove Webpack Dependencies

After migration, remove webpack-specific dependencies:

```bash
npm uninstall webpack webpack-cli webpack-dev-server html-webpack-plugin html-inline-script-webpack-plugin @pmmmwh/react-refresh-webpack-plugin webpack-bundle-analyzer speed-measure-webpack-plugin fork-ts-checker-webpack-plugin dotenv-webpack swc-loader
```

## 11. Benefits of Migration

- **Faster builds**: Vite's esbuild-powered dev server is significantly faster
- **Better HMR**: Near-instantaneous hot module replacement
- **Simpler configuration**: Less boilerplate and more intuitive setup
- **Modern defaults**: ES modules, better tree-shaking, optimized builds
- **Better development experience**: Faster startup times and rebuilds

## 12. Potential Issues and Solutions

### Issue: colorjs.io module resolution
**Solution**: Already handled in optimizeDeps.exclude

### Issue: Process polyfill
**Solution**: Added to define config and optimizeDeps.include

### Issue: Dynamic imports
**Solution**: Vite handles these better out of the box

### Issue: Bundle size for Figma plugin
**Solution**: Configure rollup options to prevent chunking when needed

## 13. Testing the Migration

1. Install dependencies: `npm install`
2. Test development build: `npm run build:dev`
3. Test production build: `npm run build`
4. Test preview mode: `npm run preview:browser`
5. Test transform build: `npm run build-transform`
6. Test benchmarks: `npm run benchmark:build`

## 14. Performance Comparison

After migration, you should see:
- Development server startup: ~2-3s (vs 10-15s with Webpack)
- HMR updates: <100ms (vs 1-3s with Webpack)
- Production builds: Similar or faster
- Bundle size: Similar or smaller due to better tree-shaking