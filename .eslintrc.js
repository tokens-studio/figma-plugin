module.exports = {
  extends: ['airbnb', 'airbnb-typescript', 'plugin:react-hooks/recommended'],
  parserOptions: {
    project: './tsconfig.json'
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
    "import/prefer-default-export": 0,
    "import/extensions": 0,
    "no-await-in-loop": 0,
    "no-param-reassign": 0,
    "class-methods-use-this": 0,
    "no-restricted-globals": 0,
    "max-len": 0,
    "react/function-component-definition": 0,
    "react/require-default-props": 0,
    "react/jsx-props-no-spreading": 0,
    "react/jsx-no-bind": [2, {
      ignoreDOMComponents: false,
      ignoreRefs: false,
      allowArrowFunctions: false,
      allowFunctions: false,
      allowBind: false,
    }],
    "@typescript-eslint/no-shadow": 1
  }
};
