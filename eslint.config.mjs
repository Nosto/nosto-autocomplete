import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginPromise from 'eslint-plugin-promise'
import barrelFiles from "eslint-plugin-barrel-files"

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
    },
    {
        plugins: {
          "barrel-files": barrelFiles
        },
        rules: {
          "barrel-files/avoid-barrel-files": 1,
          "barrel-files/avoid-importing-barrel-files": 2,
          "barrel-files/avoid-namespace-import": 2,
          "barrel-files/avoid-re-export-all": 2
        }
      }
]
