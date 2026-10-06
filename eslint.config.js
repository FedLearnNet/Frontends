// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const ngrx = require("@ngrx/eslint-plugin");

module.exports = tseslint.config(
  {
    ignores: ["node_modules/", "dist/", ".angular/"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["tsconfig.json"],
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      ...ngrx.configs.all,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      // The Angular 22 migration pinned existing components to ChangeDetectionStrategy.Eager;
      // re-enable once they are converted to OnPush.
      "@angular-eslint/prefer-on-push-component-change-detection": "off",
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: ["app", "lib"],
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["app", "lib"],
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    extends: [...angular.configs.templateRecommended],
    rules: {
      "max-len": ["warn", {code: 200}],
    },
  },
);
