import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next/**", "legacy/**", "node_modules/**", "next-env.d.ts", "coverage/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);
