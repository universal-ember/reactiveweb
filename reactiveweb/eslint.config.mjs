import { configs, disableTypedLints } from "@nullvoxpopuli/eslint-configs";

// accommodates: JS, TS, App, Addon, and V2 Addon
export default [
  ...configs.ember(import.meta.dirname),
  disableTypedLints.allTS,
  {
    files: ["**/*.ts", "**/*.gts"],
    rules: {
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "no-var": "off",
    },
  },
];
