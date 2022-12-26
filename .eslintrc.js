const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: path.join(__dirname, 'test', 'tsconfig.json'),
  },
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  plugins: ['@typescript-eslint', 'airtight', 'deprecate'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    // our typing is a mess
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',

    // TODO: these is correct, but there's too many
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          String: {
            message:
              'Use string instead unless you are referring to the constructor',
            fixWith: 'string',
          },
          Number: {
            message:
              'Use number instead unless you are referring to the constructor',
            fixWith: 'number',
          },
          Boolean: {
            message:
              'Use boolean instead unless you are referring to the constructor',
            fixWith: 'boolean',
          },
        },
        // TODO: extend to the others
        extendDefaults: false,
      },
    ],
    'no-prototype-builtins': 'off',

    // Conventions have won, sorry linter!
    '@typescript-eslint/no-empty-function': 'off',

    // non-null assertions compromise the type safety somewhat, but many
    // our types are still imprecisely defined and we don't use noImplicitAny
    // anyway, so for the time being assertions are allowed
    '@typescript-eslint/no-non-null-assertion': 'off',

    '@typescript-eslint/no-var-requires': 'warn',
    '@typescript-eslint/consistent-type-imports': 'error',

    // cares about function ordering in a file in a way we don't care about
    '@typescript-eslint/no-use-before-define': 'off',

    // promise/async abuse
    '@typescript-eslint/promise-function-async': [
      'error',
      {
        checkArrowFunctions: false,
      },
    ],
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',

    '@typescript-eslint/no-unused-vars': 'error',
    'no-buffer-constructor': 'error',

    'no-import-assign': 'error',

    'id-blacklist': [
      'error',
      // sequelize 3, deprecated aliases for e.g. `Op.and`
      '$and',
      '$or',
      '$gt',
      '$gte',
      '$lt',
      '$lte',
      '$ne',
      '$not',
      '$between',
      '$notBetween',
      '$in',
      '$notIn',
      '$like',
      '$notLike',
      '$iLike',
      '$notILike',
      '$overlap',
      '$contains',
      '$contained',
      '$any',
      '$col',
    ],

    'airtight/export-inline': 'warn',

    // Prevents deep imports from libraries
    'no-restricted-imports': [
      'error',
      {
        patterns: ['**/src/lib/*/**'],
        paths: [
          {
            name: 'request-promise-native',
            message: 'Please use needle instead.',
          },
        ],
      },
    ],
    'no-restricted-modules': ['error', { patterns: ['**/src/lib/*/**'] }],
    'deprecate/member-expression': [
      'error',
      {
        name: 'itly.projectsAreImported',
        use: 'itlyOverrides.projectsAreImported',
      },
    ],
  },

  // TODO: Uncomment the written below when cypress is committed
  // -------------------------------------------------------------
  // // these are not covered by test/tsconfig.json, so trying to lint them causes
  // // massive performance issues; as eslint tries to load the compiler (3s+) for
  // // each file, which is insane
  // ignorePatterns: ['test/cypress'],
};
