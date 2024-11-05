import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginPromise from 'eslint-plugin-promise'

export default [
    eslint.configs.recommended,
    pluginPromise.configs['flat/recommended'],
    ...tseslint.configs.recommended,
    {
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
