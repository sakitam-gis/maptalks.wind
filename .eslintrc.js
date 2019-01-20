// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true
  },
  extends: 'airbnb',
  plugins: [
    'react',
    'jsx-a11y'
  ],
  // add your custom rules here
  rules: {
    // allow semi
    'semi': 0,
    'no-plusplus': 0,
    'import/no-unresolved': 0,
    'no-param-reassign': 0,
    // allow global require
    'linebreak-style': 0,
    'global-require': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    'no-prototype-builtins': 0,
    'no-underscore-dangle': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  },
  globals: {}
};
