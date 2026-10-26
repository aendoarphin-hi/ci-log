module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',

    // Formatting / style
    'semi': 'off',
    'quotes': 'off',
    'multiline-ternary': 'off',
    'dot-notation': 'off',
    'comma-dangle': 'off',
    'space-before-function-paren': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'indent': 'off',
    'eol-last': 'off',
    'no-trailing-spaces': 'off',
    'key-spacing': 'off',
    'keyword-spacing': 'off',
    'space-before-blocks': 'off',
    'arrow-parens': 'off',

    // Potentially restrictive JavaScript rules
    'no-unused-vars': 'off',
    'no-undef': 'off',
    'no-constant-condition': 'off',
    'no-return-await': 'off',
    'prefer-const': 'off',
    'no-var': 'off',

    // Vue-specific rules
    'vue/multi-word-component-names': 'off',
    'vue/require-default-prop': 'off',
    'vue/require-prop-types': 'off'
  }
}