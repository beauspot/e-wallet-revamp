import globals from "globals";

import pluginJs from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import jest from "eslint-plugin-jest";
import prettierPlugin from "eslint-plugin-prettier";
import sonarjs from "eslint-plugin-sonarjs";
import unicorn from "eslint-plugin-unicorn";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        jest: true,
        process: "readonly"
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: process.cwd(),
        ecmaFeatures: {
          experimentalDecorators: true
        }
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
      jest: jest,
      unicorn: unicorn,
      sonarjs: sonarjs
    },
    rules: {
      "@typescript-eslint/indent": "off",
      "@typescript-eslint/no-invalid-this": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "sonarjs/cognitive-complexity": "error",
      "sonarjs/no-identical-functions": "error",
      "prettier/prettier": ["error", { parser: "typescript" }],
      "@typescript-eslint/no-unused-vars": "error",
      "no-console": "warn",
      "no-restricted-syntax": "off",
      "import/no-extraneous-dependencies": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "@typescript-eslint/no-namespace": "off",
      "no-underscore-dangle": "off",
      "import/no-cycle": "off",
      "spaced-comment": "off",
      "no-unused-vars": "error",
      quotes: ["error", "double"],
      eqeqeq: "error",
      "prefer-const": [
        "error",
        {
          ignoreReadBeforeAssign: true
        }
      ],
      "no-const-assign": "error",
      "no-control-regex": "error",
      "@typescript-eslint/no-deprecated": "error",
      "no-dupe-args": "error",
      "no-dupe-class-members": "error",
      "no-empty-character-class": "error",
      "no-unreachable": "error",
      "valid-typeof": "error",
      "dot-notation": "error",
      "no-empty": "error",
      "no-redeclare": "error",
      "no-useless-catch": "error",
      curly: "error",
      "unicorn/filename-case": "off",
      "import/prefer-default-export": "off",
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-export-from": "off"
    }
  },
  {
    ignores: [
      "coverage/**",
      "node_modules/*",
      ".idea/*",
      "logs/*",
      "dist/*",
      ".dist/*",
      ".vscode/*",
      "jots.ts",
      "testQueues.ts",
      "todos.ts"
    ]
  }
];
