#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting Webpack to Vite migration...\n');

// 1. Install Vite dependencies
console.log('📦 Installing Vite dependencies...');
try {
  execSync('npm install --save-dev vite @vitejs/plugin-react-swc @sentry/vite-plugin rollup-plugin-visualizer vite-plugin-svgr', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// 2. Create main Vite config
console.log('📄 Creating vite.config.ts...');
const viteConfig = `import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { visualizer } from 'rollup-plugin-visualizer'
import svgr from 'vite-plugin-svgr'

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
      
      svgr({
        include: "**/*.svg",
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
})`;

fs.writeFileSync('vite.config.ts', viteConfig);
console.log('✅ vite.config.ts created\n');

// 3. Create transform config
console.log('📄 Creating vite-transform.config.ts...');
const transformConfig = `import { defineConfig } from 'vite'
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
})`;

fs.writeFileSync('vite-transform.config.ts', transformConfig);
console.log('✅ vite-transform.config.ts created\n');

// 4. Create benchmark config
console.log('📄 Creating vite-benchmark.config.ts...');
const benchmarkConfig = `import { defineConfig } from 'vite'
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
})`;

fs.writeFileSync('vite-benchmark.config.ts', benchmarkConfig);
console.log('✅ vite-benchmark.config.ts created\n');

// 5. Update package.json scripts
console.log('📄 Updating package.json scripts...');
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Create backup
fs.writeFileSync('package.json.backup', JSON.stringify(packageJson, null, 2));
console.log('📄 Created package.json.backup');

// Update scripts
const newScripts = {
  ...packageJson.scripts,
  "build": "cross-env NODE_ENV=production vite build",
  "build:dev": "cross-env NODE_ENV=development vite build --mode development",
  "build:preview": "cross-env NODE_ENV=development PREVIEW_ENV=browser vite build --mode development",
  "build:cy": "cross-env LAUNCHDARKLY_FLAGS=tokenThemes,gitBranchSelector,multiFileSync,tokenFlowButton npm run build",
  "start": "cross-env vite build --mode development --watch",
  "preview:browser": "cross-env PREVIEW_ENV=browser vite dev",
  "build-transform": "vite build --config vite-transform.config.ts --mode production",
  "benchmark:build": "vite build --config vite-benchmark.config.ts"
};

packageJson.scripts = newScripts;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json scripts updated\n');

// 6. Create index.html if it doesn't exist
console.log('📄 Checking for index.html...');
if (!fs.existsSync('index.html')) {
  const htmlTemplate = `<!DOCTYPE html>
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
</html>`;
  
  fs.writeFileSync('index.html', htmlTemplate);
  console.log('✅ Created index.html');
} else {
  console.log('✅ index.html already exists');
}

console.log('\n🎉 Migration completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Review the generated config files');
console.log('2. Test the build: npm run build:dev');
console.log('3. Test the dev server: npm run preview:browser');
console.log('4. Remove webpack dependencies: npm uninstall webpack webpack-cli webpack-dev-server html-webpack-plugin html-inline-script-webpack-plugin @pmmmwh/react-refresh-webpack-plugin webpack-bundle-analyzer speed-measure-webpack-plugin fork-ts-checker-webpack-plugin dotenv-webpack swc-loader');
console.log('5. Update your CI/CD scripts if needed');
console.log('\n📚 See VITE_MIGRATION_GUIDE.md for detailed information');