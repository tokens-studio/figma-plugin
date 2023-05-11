const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const babelConfig = require('../babel.config.js');
module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/stories/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },
  webpackFinal: async (config, {
    configType
  }) => {

    config.resolve.plugins = [new TsconfigPathsPlugin()]


    config.module.rules = config.module.rules.map(r => {
      if ('.tsx'.match(r.test)) {
        return {
          ...r,
          use: [].concat(r.use, [{
            loader: 'babel-loader',
            options: {
              ...babelConfig,
              presets: [...babelConfig.presets, '@babel/preset-typescript']
            }
          }])
        };
      }
      return r;
    });

    // Remove the default .css webpack module rule
    // This is necessary because we use both global CSS and CSS modules
    // in the extension and in Storybook
    config.module.rules = config.module.rules.filter(r => {
      if ('.css'.match(r.test)) {
        return false;
      }
      return true;
    });
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }, {
      type: 'javascript/auto',
      test: /\.mjs$/,
      include: /node_modules/
    });
    config.module.rules = config.module.rules.filter(r => {
      if ('.svg'.match(r.test)) {
        return false;
      }
      return true;
    });
    config.module.rules.push({
      test: /\.svg$/,
      use: [{
        loader: '@svgr/webpack',
        options: {
          svgoConfig: {
            plugins: [{
              removeViewBox: false
            }]
          }
        }
      }]
    });
    return config;
  },
  typescript: {
    typescript: {
      check: false,
      checkOptions: {},
      reactDocgen: 'react-docgen-typescript',
      reactDocgenTypescriptOptions: {
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: prop => prop.parent ? !/node_modules/.test(prop.parent.fileName) : true
      }
    }
  },
  docs: {
    autodocs: true
  }
};