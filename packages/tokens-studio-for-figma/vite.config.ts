import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import fs from 'fs';

// Custom plugin to handle environment variables like dotenv-webpack
const envPlugin = (mode: string): Plugin => {
  return {
    name: 'env-plugin',
    config(config, { mode: configMode }) {
      const envMode = mode === 'production' ? 'production' : 'development';
      const envPath = envMode === 'production' ? '.env.production' : '.env';
      
      // Load env file
      if (fs.existsSync(envPath)) {
        const env = loadEnv(envMode, process.cwd(), '');
        
        // Make env vars available to the app
        return {
          define: {
            'process.env.MIXPANEL_ACCESS_TOKEN': JSON.stringify(env.MIXPANEL_ACCESS_TOKEN || ''),
            'process.env.STORYBLOK_ACCESS_TOKEN': JSON.stringify(env.STORYBLOK_ACCESS_TOKEN || ''),
            'process.env.ENVIRONMENT': JSON.stringify(env.ENVIRONMENT || envMode),
            'process.env.LICENSE_API_URL': JSON.stringify(env.LICENSE_API_URL || ''),
            'process.env.LAUNCHDARKLY_SDK_CLIENT': JSON.stringify(env.LAUNCHDARKLY_SDK_CLIENT || ''),
            'process.env.SENTRY_DSN': JSON.stringify(env.SENTRY_DSN || ''),
            'process.env.SENTRY_AUTH_TOKEN': JSON.stringify(env.SENTRY_AUTH_TOKEN || ''),
            'process.env.SENTRY_SAMPLING': JSON.stringify(env.SENTRY_SAMPLING || ''),
            'process.env.SENTRY_PROFILE_SAMPLING': JSON.stringify(env.SENTRY_PROFILE_SAMPLING || ''),
            'process.env.SENTRY_REPLAY_SAMPLING': JSON.stringify(env.SENTRY_REPLAY_SAMPLING || ''),
            'process.env.TOKENS_STUDIO_API_HOST': JSON.stringify(env.TOKENS_STUDIO_API_HOST || ''),
          },
        };
      }
      
      return {};
    },
  };
};

// Plugin to inline the UI script into HTML for Figma plugin and control output path
const htmlInlinePlugin = (isBrowser: boolean): Plugin | null => {
  if (isBrowser) return null;
  
  return {
    name: 'html-inline-plugin',
    enforce: 'post',
    generateBundle(options, bundle) {
      // Find the HTML file and UI JS file
      const htmlFile = Object.keys(bundle).find(file => file.endsWith('.html'));
      const uiJsFile = Object.keys(bundle).find(file => file === 'ui.js');
      
      if (htmlFile && uiJsFile) {
        const htmlAsset = bundle[htmlFile];
        const jsChunk = bundle[uiJsFile];
        
        if (htmlAsset.type === 'asset' && jsChunk.type === 'chunk') {
          // Get all CSS files
          const cssFiles = Object.keys(bundle).filter(file => file.endsWith('.css'));
          let cssContent = '';
          cssFiles.forEach(cssFile => {
            const css = bundle[cssFile];
            if (css.type === 'asset' && typeof css.source === 'string') {
              cssContent += css.source;
              delete bundle[cssFile];
            }
          });
          
          // Inline the JS and CSS into HTML
          let html = htmlAsset.source as string;
          
          // Add inlined CSS
          if (cssContent) {
            html = html.replace('</head>', `<style>${cssContent}</style></head>`);
          }
          
          // Replace script tag with inline script
          html = html.replace(
            /<script[^>]*type="module"[^>]*src="[^"]*"[^>]*><\/script>/,
            `<script>${jsChunk.code}</script>`
          );
          
          // Update the HTML content
          htmlAsset.source = html;
          htmlAsset.fileName = 'index.html';
          
          // Move to root if needed
          if (htmlFile !== 'index.html') {
            delete bundle[htmlFile];
            bundle['index.html'] = htmlAsset;
          }
        }
      }
    },
  };
};

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const previewEnv = process.env.PREVIEW_ENV || 'figma';
  const isBrowser = previewEnv === 'browser';
  const analyzeBundle = process.env.ANALYZE_BUNDLE === 'true';
  
  return {
    plugins: [
      react({
        babel: {
          plugins: [
            // Only enable react-refresh in browser preview mode
            ...(isBrowser && !isProduction ? [] : []),
          ],
        },
      }),
      svgr({
        include: '**/*.svg',
        svgrOptions: {
          exportType: 'default',
        },
      }),
      envPlugin(mode),
      htmlInlinePlugin(isBrowser),
      analyzeBundle && visualizer({
        filename: './dist/stats.html',
        open: false,
      }),
    ].filter(Boolean) as Plugin[],
    
    define: {
      'process.env.PREVIEW_ENV': JSON.stringify(previewEnv),
      'process.env.LAUNCHDARKLY_FLAGS': JSON.stringify(process.env.LAUNCHDARKLY_FLAGS || ''),
      'process.env.NODE_ENV': JSON.stringify(mode),
      global: 'globalThis',
    },
    
    resolve: {
      alias: {
        Types: path.resolve(__dirname, 'types'),
        '@types': path.resolve(__dirname, 'types'),
        '@': path.resolve(__dirname, 'src'),
        'react-redux': 'react-redux/dist/react-redux.js',
        // Polyfills for Node.js modules
        buffer: 'buffer',
        process: 'process/browser',
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
    },
    
    build: {
      outDir: isBrowser ? 'preview' : 'dist',
      sourcemap: isProduction ? true : 'inline',
      minify: isProduction,
      target: 'es2020',
      
      rollupOptions: {
        input: {
          ui: path.resolve(__dirname, 'src/app/index.html'),
          code: path.resolve(__dirname, 'src/plugin/controller.ts'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            // Keep 'code.js' for plugin code
            if (chunkInfo.name === 'code') {
              return 'code.js';
            }
            return 'ui.js';
          },
          chunkFileNames: '_[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.html')) {
              return 'index.html';
            }
            return '[name][extname]';
          },
          // Don't create shared chunks - inline everything into the entry chunks
          inlineDynamicImports: false,
          manualChunks: undefined,
        },
        // Prevent code splitting
        preserveEntrySignatures: 'strict',
      },
      
      // Increase chunk size warning limit for plugin bundles
      chunkSizeWarningLimit: 10000,
    },
    
    optimizeDeps: {
      include: ['buffer', 'process'],
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
      },
    },
    
    server: {
      port: 9000,
      open: false,
      hmr: isBrowser,
    },
    
    // Handle CSS
    css: {
      modules: false,
    },
  };
});
