const path = require('path');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? 'source-map' : 'inline-source-map',

  entry: {
    ui: './src/app/index.tsx', // The entry point for your UI code
    code: './src/plugin/controller.ts', // The entry point for your plugin code
    transform: './src/utils/transform.ts', // The entry point for your plugin code
  },

  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        exclude: /node_modules/,
      },
      // Fixing colorjs imports, see https://github.com/tokens-studio/figma-plugin/pull/1498#issuecomment-1372082627
      {
        test: /\.c?js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        exclude:  /node_modules\/(?!(colorjs.io)\/)/,
      },
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
            options: {
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
            },
          },
        ],
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        include: /node_modules/,
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
      buffer: require.resolve('buffer/'),
    },
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },

  output: {
    filename: '[name].js',
    sourceMapFilename: "[name].js.map",
    path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new Dotenv({
      path: argv.mode === 'production' ? '.env.production' : '.env',
    }),
    new HtmlWebpackPlugin({
      template: './src/app/index.html',
      filename: 'index.html',
      chunks: ['ui'],
      cache: argv.mode === 'production',
    }),
    new HtmlInlineScriptPlugin(),
    new webpack.DefinePlugin({
      'process.env.LAUNCHDARKLY_FLAGS': JSON.stringify(process.env.LAUNCHDARKLY_FLAGS),
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
  ],
});
