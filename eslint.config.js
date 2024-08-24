import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname, // 필수: 현재 디렉토리 설정
});

export default [
    ...compat.extends('airbnb-base'),
    ...compat.extends('plugin:prettier/recommended'),
    {
        languageOptions: {
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
            },
        },
        rules: {
            'prettier/prettier': ['error'],
            'no-console': 'off',
            'no-underscore-dangle': [
                'error',
                { allow: ['__dirname', '__filename'] },
            ],
            'import/extensions': 'off',
            'import/no-extraneous-dependencies': 'off',
            'import/no-named-as-default': 'off',
            'import/no-named-as-default-member': 'off',
        },
        ignores: [
            'node_modules/',
            'package.json',
            'package-lock.json',
            'yarn-error.json',
            'yarn.lock',
            '*.md',
            '*.log',
        ],
    },
];
