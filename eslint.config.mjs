import tsParser from "@typescript-eslint/parser"
import js from "@eslint/js"
import { FlatCompat } from "@eslint/eslintrc"

const compat = new FlatCompat({
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
})

export default [
    ...compat.extends(
        "eslint:recommended",
        "plugin:promise/recommended",
        "plugin:@typescript-eslint/recommended"
    ),
    {
        languageOptions: {
            parser: tsParser,
            ecmaVersion: "latest",
            sourceType: "module",
        },

        rules: {
            "promise/prefer-await-to-then": "error",
            "@typescript-eslint/consistent-type-assertions": [
                "error",
                {
                    assertionStyle: "never",
                }
            ]
        }
    }
]
