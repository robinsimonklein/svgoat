import withNuxt from './.nuxt/eslint.config.mjs';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default withNuxt(eslintPluginPrettierRecommended, {
  rules: {
    'vue/multi-word-component-names': ['off'],
    'vue/no-v-html': ['off'],
    'vue/valid-template-root': ['off'],
    'vue/require-default-prop': ['off'],

    '@typescript-eslint/ban-ts-comment': ['off'],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/unified-signatures': ['off'],

    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'prefer-const': ['error'],
    'no-var': ['error'],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
});
