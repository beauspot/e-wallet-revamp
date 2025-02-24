import globals from "globals";
import pluginJs from "@eslint/js";
import tslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.browser }},
  {
    rules: {
      "quotes": ["error", "double"],
      eqeqeq: "error",
      "no-unused-vars": "error",
      "prefer-const": ["error", { ignoreReadBeforeAssign: true}],
      "reportUnusedInlineConfigs": "error",
      "no-const-assign": "error",
      "no-control-regex": "error",
      "no-deprecated": "error",
      "no-dupe-args": "error",
      "no-dupe-class-members": "error",
      "no-dupe-import": "error",
      "no-dupe-class-properties": "error",
      "no-dupe-class-methods": "error",
      "no-empty-character-class": "error",
      "no-unreachable": "error",
      "valid-typeof": "error",
      "curly": "error",
      "dot-notation": "error",
      "no-empty": "error",
      "no-redeclare": "error",
      "no-useless-catch": "error",

    },
    ignores: [
        ".node_modules/*",
        ".idea/*",
        "logs/*",
        "coverage/*",
        ".dist/*",
        ".vscode/*",
        "jots.ts",
        "testQueues.ts",
        "todos.ts"
    ]
  },
  pluginJs.configs.recommended,
  ...tslint.configs.recommended,
];