import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import jest from "eslint-plugin-jest";

export default [
  js.configs.recommended, // Base JS recommended rules
  {
    ignores: [
      "coverage/**",
      "node_modules/*",
      ".idea/*",
      "logs/*",
      "dist/*",
      ".vscode/*",
      "/jots.ts",
      "/testQueues.ts",
      "/todos.ts",
      "eslint.config.js" // Ignore ESLint config itself
    ],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd()
      },
      globals: {
        jest: true // Define Jest global variables
      }
    },
    plugins: {
      "@typescript-eslint": ts,
      prettier,
      jest
    },
    extends: [
      "plugin:@typescript-eslint/recommended", // TypeScript recommended rules
      "plugin:prettier/recommended", // Prettier recommended rules
      "plugin:jest/recommended", // Jest recommended rules
      "airbnb-base",
      "airbnb-typescript/base",
      "prettier"
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "no-console": "warn",
      "no-restricted-syntax": "off",
      "import/no-extraneous-dependencies": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "@typescript-eslint/no-namespace": "off",
      "no-underscore-dangle": "off",
      "import/no-cycle": "off",
      "@typescript-eslint/no-throw-literal": "error",
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
      curly: "error"
    }
  },
  // Override for eslint.config.js to avoid TypeScript parsing errors
  // {
  //   files: ["eslint.config.js"],
  //   languageOptions: {
  //     parserOptions: {
  //       project: null // Disable TypeScript project parsing for this file
  //     }
  //   }
  // }
];
