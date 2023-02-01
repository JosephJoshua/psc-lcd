/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ['prettier', 'eslint:recommended'],
  plugins: ['unused-imports'],
  overrides: [
    {
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
      ],
      files: ['**/*.ts', '**/*.tsx'],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': 'off',

        // https://github.com/react-hook-form/react-hook-form/discussions/8020
        '@typescript-eslint/no-misused-promises': 'off',

        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
      },
    },
  ],
  root: true,
  reportUnusedDisableDirectives: true,
  ignorePatterns: ['.eslintrc.js', '**/*.config.js', '**/*.config.cjs'],
};

module.exports = config;
