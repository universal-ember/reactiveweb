import { configs, disableTypedLints } from "@nullvoxpopuli/eslint-configs";

export default [
  ...configs.ember(import.meta.dirname),
  disableTypedLints.allTS,
  {
    files: ["**/*.ts"],
    rules: {
      /**
       * This one is incorrectly parsed for now, because
       * the rule doesn't understand decorators
       */
      "@typescript-eslint/no-unused-vars": "off",

      /**
       * any can be useful
       */
      "@typescript-eslint/no-explicit-any": "off",

      /**
       * Some compiler errors are not helpful
       */
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "ts-nocheck": "allow-with-description",
          "ts-check": "allow-with-description",
          "ts-expect-error": "allow-with-description",
        },
      ],
    },
  },
];
