const path = require('path');
module.exports = {
  stories: [ "../src/**/*.stories.mdx", "../src/stories/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: '@storybook/addon-docs',
      options:{
        configureJSX: true,
      }
    }
  ],
  framework: "@storybook/react",
  webpackFinal: async (config, { configType }) => {
    config.mode = 'none';
    config.resolve.alias['@'] = path.resolve(__dirname, '../src/');
    return config;
  },
  typescript: {
    typescript: {
      check: false,
      checkOptions: {},
      reactDocgen:  'react-docgen-typescript',
      reactDocgenTypescriptOptions:{
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
      },
    },
  }
}