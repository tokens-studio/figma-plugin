const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
const dotenv = require('dotenv');

const modeArg = process.argv.filter(str => str.startsWith('--mode')).shift();
const mode = modeArg !== undefined ? modeArg.split('=')[1].trim() : 'development';
const devMode = mode !== 'production';


const { version } = require('./package.json');

module.exports = (env, argv) => {

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
    },

    module: {
      rules: [
        // Converts TypeScript code to JavaScript
        {
          test: /\.[jt]sx?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: require.resolve('babel-loader'),
              options: {
                plugins: [argv.PREVIEW_ENV === 'browser' && require.resolve('react-refresh/babel')].filter(Boolean),
              },
            },
          ],
        },

        // {
        //   test: /\.tsx?$/,
        //   use: [
        //     {
        //       loader: 'swc-loader',
        //       options: {
        //         jsc: { transform: { react: { refresh: devMode }}}
        //       }
        //     },
        //   ],
        //   exclude: /(node_modules|.*\.test\.(js|ts))/
        // },
        // {
        //   test: /\.c?js$/,
        //   // We don't add an exclude for node_modules as we need to aggressively optimize code deps
        //   exclude: argv.mode === 'production' ? undefined : /node_modules\/(?!(colorjs.io)\/)/,
        //   use: [
        //     {
        //       loader: 'swc-loader',
        //     },
        //   ],
        // },
        // Enables including CSS by doing "import './file.css'" in your TypeScript code
        { test: /\.css$/, use: [{ loader: 'style-loader' }, { loader: 'css-loader' }] },
        // Imports webfonts
        {
          test: /\.(woff|woff2)$/,
          use: {
            loader: 'url-loader',
            options: {
              name: '[name].[ext]',
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
        process:false,
        "http": false,
        https:false,
        buffer: require.resolve('buffer/'),
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
      publicPath: '',
      filename: '[name].js',
      sourceMapFilename: "[name].js.map",
      path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
    },
    // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
    plugins: [
      argv.PREVIEW_ENV === 'browser' && new ReactRefreshPlugin(),
      // argv.PREVIEW_ENV === 'browser' && new ForkTsCheckerWebpackPlugin(),
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
      // argv.PREVIEW_ENV !== 'browser' && new HtmlWebpackInlineSourcePlugin(),
      new webpack.DefinePlugin({
        'process.env':  {
          PREVIEW_ENV: JSON.stringify(argv.PREVIEW_ENV),
          LAUNCHDARKLY_FLAGS: JSON.stringify(process.env.LAUNCHDARKLY_FLAGS),
        },
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
      // new BundleAnalyzerPlugin()
    ].filter(Boolean),
  }
};
