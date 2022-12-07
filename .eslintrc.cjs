/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    extends: ['plugin:vue/vue3-essential', 'eslint:recommended', '@vue/eslint-config-typescript', '@vue/eslint-config-prettier'],
    parserOptions: {
        ecmaVersion: 'latest',
    },
    rules: {
        'prettier/prettier': [
            'warn',
            {
                tabWidth: 4,
                singleQuote: true,
                semi: true,
                printWidth: 500,
                bracketSpacing: true,
                'spaced-comment': 2,
            },
        ],
    },
};
