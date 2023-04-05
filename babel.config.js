module.exports = {
  presets: [['@babel/preset-env', {
    modules: false,
  }], '@babel/preset-typescript', '@babel/preset-react'],
  plugins: ['@babel/proposal-class-properties', '@babel/proposal-object-rest-spread', "@babel/transform-typescript", "@babel/plugin-proposal-private-methods"],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: 'commonjs',
            targets: {
              node: 'current',
            },
          },
        ],
      ],
    },
  },
};
