import { defineConfig, loadEnv } from 'vite'
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
})