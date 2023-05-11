module.exports = {
  presets: [['@babel/preset-env', {
    modules: false,
    "targets": {
       "node": "12" 
    }
  }], '@babel/preset-react'],
  plugins: [
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    "@babel/plugin-proposal-private-methods"
  ],
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
