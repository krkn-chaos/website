const globals = require("globals");

module.exports = [
  {
    // Node.js files: scripts, API, Netlify functions
    files: [
      "scripts/**/*.js",
      "api/**/*.js",
      "netlify/**/*.js",
      "eslint.config.js",
    ],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.es2020,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-var": "warn",
      "prefer-const": "warn",
      "eqeqeq": ["warn", "always"],
    },
  },
  {
    // Browser-side files served via Hugo
    files: ["static/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrors: "none" }],
      "no-var": "warn",
      "prefer-const": "warn",
      "eqeqeq": ["warn", "always"],
    },
  },
  {
    // Ignore build output dirs
    ignores: ["public/**", "node_modules/**", "resources/**"],
  },
];
