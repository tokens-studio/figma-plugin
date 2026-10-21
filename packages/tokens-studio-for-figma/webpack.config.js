const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
const dotenv = require('dotenv');



const { version } = require('./package.json');

const wrapper = (callback) => {
  const measureSpeed = false;
  if (!measureSpeed) { // Set to true to enable SpeedMeasurePlugin (breaks Figma UI build)
      return callback;
  }
  const smp = new SpeedMeasurePlugin();

  return smp.wrap(callback);
};

module.exports = wrapper((env, argv) => {
  const isDevServer = process.env.WEBPACK_DEV_SERVER;

  //Needed to load the process.env variables for sentry
  dotenv.config({
    path: argv.mode === 'production' ? '.env.production' : '.env',
  });

  return {
    mode: argv.mode === 'production' ? 'production' : 'development',

    // This is necessary because Figma's 'eval' works differently than normal eval
    devtool: argv.mode === 'production' ? 'source-map' : 'inline-source-map',

    entry: {
      ui: './src/app/index.tsx', // The entry point for your UI code
      code: './src/plugin/controller.ts', // The entry point for your plugin code
    },

    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      compress: true,
      open: false,
      // openPage: '/ui.html',
      hot: true,
      inline: true,
      historyApiFallback: true,
      port: 9000,
      overlay: false,
    },

    module: {
      rules: [
        // Converts TypeScript code to JavaScript
        // Development fast reload
        ...(argv.PREVIEW_ENV === 'browser' && isDevServer ? [{
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'swc-loader',
              options: {
                jsc: {
                  transform: {
                    react: {
                      development: argv.mode === 'development',
                      refresh: argv.mode === 'development'
                    }
                  }
                }
              }
            },
          ],
        }] : [{
          test: /\.tsx?$/,
          use: [
            {
              loader: 'swc-loader',
            },
          ],
          exclude: /(node_modules|.*\.test\.(js|ts))/
        },
        {
          test: /\.c?js$/,
          // We don't add an exclude for node_modules as we need to aggressively optimize code deps
          exclude: argv.mode === 'production' ? undefined : /node_modules\/(?!(colorjs.io)\/)/,
          use: [
            {
              loader: 'swc-loader',
            },
          ],
        }]),
        // Enables including CSS by doing "import './file.css'" in your TypeScript code
        { 
          test: /\.css$/, 
          use: [
            { loader: 'style-loader' }, 
            { 
              loader: 'css-loader',
              options: {
                url: true,
                import: true,
              }
            }
          ] 
        },
        // Imports webfonts
        {
          test: /\.(woff|woff2)$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 1000000, // Inline files up to 1MB (all our fonts)
            },
          },
        },
        { test: /\.(png|jpg|gif|webp)$/, use: [{ loader: 'url-loader' }] },
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
            },
          ],
        },
      ],
    },

    // Webpack tries these extensions for you if you omit the extension like "import './file'"
    resolve: {
      alias: {
        Types: path.resolve(__dirname, 'types'),
        '@types': path.resolve(__dirname, 'types'),
        '@': path.resolve(__dirname, 'src'),
        'react-redux': 'react-redux/dist/react-redux.js',
      },
      fallback: {
        process: false,
        http: false,
        https: false,
        buffer: require.resolve('buffer/'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        vm: require.resolve('vm-browserify'),
      },
      extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    // Don't minimize the code in development mode, it causes the plugin to build much slower
    optimization: {
      nodeEnv: argv.mode === 'production' ? 'production' : 'development',
      minimize: argv.mode === 'production',
      usedExports: true,
      concatenateModules: true
    },
    output: {
      publicPath: '/',
      filename: '[name].js',
      sourceMapFilename: "[name].js.map",
      path: path.resolve(__dirname, argv.PREVIEW_ENV === 'browser' && !isDevServer ? 'preview' : 'dist'), // Compile into a folder called "dist"
    },
    // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
    plugins: [
      isDevServer && argv.PREVIEW_ENV === 'browser' && new ReactRefreshPlugin({ overlay: false }),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new Dotenv({
        path: argv.mode === 'production' ? '.env.production' : '.env',
      }),
      process.env.SENTRY_AUTH_TOKEN ?
        sentryWebpackPlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          debug: true,
          // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
          // and need `project:releases` and `org:read` scopes
          authToken: process.env.SENTRY_AUTH_TOKEN,
          telemetry: false,
          sourcemaps: {
            filesToDeleteAfterUpload: ['dist/*.js.map', '*.js.map', 'ui.js']
          },
          release: {
            name: 'figma-tokens@' + version,
            finalize: true,
            cleanArtifacts: true,
            deploy: {
              name: 'plugin@' + version,
              env: process.env.ENVIRONMENT
            },
            setCommits: {
              auto: true,
              ignoreMissing: true,
            }
          },
        }) : undefined,
      new HtmlWebpackPlugin({
        template: './src/app/index.html',
        inject: 'body',
        filename: 'index.html',
        chunks: ['ui'],
        cache: argv.mode === 'production',
      }),
      argv.PREVIEW_ENV !== 'browser' && new HtmlInlineScriptPlugin({
        assetPreservePattern: [/\.js$/],
      }),
      new webpack.DefinePlugin({
        'process.env.PREVIEW_ENV': JSON.stringify(argv.PREVIEW_ENV),
      }),
      new ForkTsCheckerWebpackPlugin({
        async: argv.mode === 'development',
        typescript: {
          configFile: 'tsconfig.build.json',
        },
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
      argv.ANALYZE_BUNDLE && new BundleAnalyzerPlugin({ openAnalyzer: false }),
    ].filter(Boolean),
  }
});
// });
