module.exports = {
    env: {
        node: true,
        commonjs: true,
        es2021: true
    },
    ignorePatterns: ['jest.setup.js', 'jest.config.js', 'test/'],
    extends: 'eslint:recommended',
    parserOptions: {
        ecmaVersion: 12
    },
    rules: {
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-console': 'off'
    }
};
