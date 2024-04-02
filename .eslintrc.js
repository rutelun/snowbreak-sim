module.exports = {
  extends: [
    "plugin:import/recommended",
    "plugin:react/recommended",
    "airbnb-typescript",
    "prettier",
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  rules: {
    "typescript-eslint/no-use-before-define": "off",
    "import/prefer-default-export": "off",
    "@typescript-eslint/no-use-before-define": "off",
    "class-methods-use-this": "off",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "import/extensions": "off",
    "react/react-in-jsx-scope": "off",
  },
  ignorePatterns: [".eslintrc.js", "postcss.config.js"],
  settings: {
    react: { version: "18" },
  },
};
