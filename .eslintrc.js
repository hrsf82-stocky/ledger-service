/**
 * These rules enforce Airbnb JavaScript's style guide.
 * Visit this repo for more information:
 *   https://github.com/airbnb/javascript
 */

module.exports = {
  "extends": "airbnb-base",
  "env": {
    "browser": true,
    "node": true,
    "es6": true,
    "mocha": true
  },
  "rules": {
    "comma-dangle": ["error", "never"],
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}],
    "no-console": 0,
    "no-shadow": 0,
    "new-cap": [2, {"capIsNewExceptions": ["Immutable.Map", "Immutable.Set", "Immutable.List"]}],
    "object-curly-newline": ["error", { "multiline": true, "minProperties": 8 }],
    "no-unused-vars": ["error", { "args": "none" }]
  }
};

/**
 * These rules enforce Hack Reactor's style guide.
 * Visit this repo for more information:
 *   https://github.com/reactorcore/eslint-config-hackreactor
 */

// module.exports = {
//   env: {
//     'es6': true
//   },
//   parserOptions: {
//     ecmaVersion: 6,
//     sourceType: "module",
//     ecmaFeatures: {
//       'jsx': true
//     }
//   },
//   rules: {
//     /* Indentation */
//     'no-mixed-spaces-and-tabs': 2,
//     'indent': [2, 2],
//     /* Language constructs */
//     'curly': 2,
//     'eqeqeq': [2, 'smart'],
//     'func-style': [2, 'expression'],
//     /* Semicolons */
//     'semi': 2,
//     'no-extra-semi': 2,
//     /* Padding & additional whitespace (perferred but optional) */
//     'brace-style': [2, '1tbs', { 'allowSingleLine': true }],
//     'semi-spacing': 1,
//     'key-spacing': 1,
//     'block-spacing': 1,
//     'comma-spacing': 1,
//     'no-multi-spaces': 1,
//     'space-before-blocks': 1,
//     'keyword-spacing': [1, { 'before': true, 'after': true }],
//     'space-infix-ops': 1,
//     /* Variable declaration */
//     'one-var': [1, { 'uninitialized': 'always', 'initialized': 'never' }],
//     /* Minuta */
//     'comma-style': [2, 'last'],
//     'quotes': [1, 'single']
//   }
// };