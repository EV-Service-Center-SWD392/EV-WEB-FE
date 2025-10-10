import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // ⚙️ Base config kế thừa từ Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // ✅ Cấu hình bổ sung cho dự án
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],

    rules: {
      // 🧠 React & Hooks
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // 📦 Imports
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          "newlines-between": "always",
        },
      ],

      // 🧹 Code cleanliness
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "warn",

      // 🧩 Next.js-specific tweaks
      "@next/next/no-img-element": "off", // Cho phép <img> nếu cần

      // 🎨 Optional (nếu bạn dùng Prettier)
      // "prettier/prettier": ["error"]
    },
  },
];
