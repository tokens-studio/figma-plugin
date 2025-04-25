module.exports = {
  extends: ['airbnb', 'airbnb-typescript', 'plugin:react-hooks/recommended'],
  plugins: ['validate-jsx-nesting'],
  parserOptions: {
    // Extending tsconfig for tests, the `*.mock.d.ts` files were not being recognized
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ['**/*.js'],
  globals: {
    figma: 'readable',
    __html__: 'readable',
    describe: 'readable',
    it: 'readable',
    expect: 'readable',
    cy: 'readable',
    jest: 'readable',
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'import/no-cycle': 0,
    'import/prefer-default-export': 0,
    'import/extensions': 0,
    'no-await-in-loop': 0,
    'no-param-reassign': 0,
    'class-methods-use-this': 0,
    'no-restricted-globals': 0,
    'max-len': 0,
    'react/function-component-definition': 0,
    'react/require-default-props': 0,
    'react/jsx-props-no-spreading': 0,
    'no-prototype-builtins': 0,
    'no-async-promise-executor': 0,
    '@typescript-eslint/return-await': 0,
    'no-restricted-syntax': ['error', 'ForInStatement', 'LabeledStatement', 'WithStatement'],
    '@typescript-eslint/ban-types': [
      2,
      {
        types: {
          object: {
            message:
              'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.\n- If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.\n- If you want a type meaning "any value", you probably want `unknown` instead.',
          },
        },
        extendDefaults: true,
      },
    ],
    'react/jsx-no-bind': [
      2,
      {
        ignoreDOMComponents: false,
        ignoreRefs: false,
        allowArrowFunctions: false,
        allowFunctions: false,
        allowBind: false,
      },
    ],
    '@typescript-eslint/no-shadow': 1,
    'validate-jsx-nesting/no-invalid-jsx-nesting': 2,
  },
  overrides: [
    {
      files: ['**/benchmark/**', '**/mocks/**', 'cypress.config.ts'],
      rules: {
        'import/no-extraneous-dependencies': 0,
      },
    },
  ],
};
