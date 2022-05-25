const path = require('path');
const webpack = require("webpack");
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/stories/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
      }
    }
  ],
  features: {
        interactionsDebugger: true,
    },
  core: {
        builder: "webpack5",
    },
  framework: "@storybook/react",
  webpackFinal: async (config, { configType }) => {
    config.mode = 'none';
    config.resolve.alias['@'] = path.resolve(__dirname, '../src/');
    config.plugins = [
            ...config.plugins,
            new webpack.NormalModuleReplacementPlugin(
                /webextension-polyfill-ts/,
                (resource) => {
                    // Gets absolute path to mock `webextension-polyfill-ts` package
                    // NOTE: this is required beacuse the `webextension-polyfill-ts`
                    // package can't be used outside the environment provided by web extensions
                    const absRootMockPath = path.resolve(
                        __dirname,
                        "../src/__mocks__/webextension-polyfill-ts.ts",
                    );

                    // Gets relative path from requesting module to our mocked module
                    const relativePath = path.relative(
                        resource.context,
                        absRootMockPath,
                    );

                    // Updates the `resource.request` to reference our mocked module instead of the real one
                    switch (process.platform) {
                        case "win32": {
                            resource.request = "./" + relativePath;
                            break;
                        }
                        default: {
                            resource.request = relativePath;
                            break;
                        }
                    }
                },
            ),
        ];
        // Remove the default .css webpack module rule
        // This is necessary because we use both global CSS and CSS modules
        // in the extension and in Storybook
        config.module.rules = config.module.rules.filter((r) => {
            if (".css".match(r.test)) {
                return false;
            }
            return true
        })

        config.module.rules.push({
            test: /\app.css$/,
            use: [
                "style-loader",
                "css-loader",
                "postcss-loader",
            ],
        })

        // Load .module.css files as CSS modules
        config.module.rules.push({
            test: /\.module.css$/,
            use: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        modules: true,
                    },
                },
                "postcss-loader",
            ],
        })

    return config;
  },
  typescript: {
    typescript: {
      check: false,
      checkOptions: {},
      reactDocgen: 'react-docgen-typescript',
      reactDocgenTypescriptOptions: {
        shouldExtractLiteralValuesFromEnum: true,
        propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
      },
    },
  }
}