module.exports = {
  extends: ["airbnb", "airbnb-typescript", "prettier"],
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
  },
  ignorePatterns: [".eslintrc.js", "postcss.config.js"],
};
