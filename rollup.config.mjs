import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from "rollup-plugin-esbuild"
import dts from "rollup-plugin-dts"
import alias from '@rollup/plugin-alias'

const preactAliases = {
  entries: [
    { find: 'react', replacement: 'preact/compat' },
    { find: 'react-dom', replacement: 'preact/compat' }
  ]
}

export default [
  ...createConfigs('src/entries/base.ts', 'dist/autocomplete.[ext]'),
  ...createConfigs('src/entries/preact.ts', 'dist/preact/autocomplete.[ext]', preactAliases),
  ...createConfigs('src/entries/react.ts', 'dist/react/autocomplete.[ext]'),
  ...createConfigs('src/entries/liquid.ts', 'dist/liquid/autocomplete.[ext]'),
  ...createConfigs('src/entries/mustache.ts', 'dist/mustache/autocomplete.[ext]'),
]

function createConfigs(input, outputTemplate, aliasConfig = {}) {
  // TODO handle aliases
  return [{
    plugins: [
      resolve(), 
      commonjs(),
      alias(aliasConfig),
      esbuild()
    ],
    jsx: "react-jsx",
    input,
    output: [
      {
        file: outputTemplate.replace("[ext]", "mjs"),
        format: 'es',
        sourcemap: true,
      },
      {
        file: outputTemplate.replace("[ext]", "cjs"),
        format: 'cjs',
        sourcemap: true,
      }
    ]  
  },
  {
    plugins: [
      dts()
    ],
    input,
    output: {
      file: outputTemplate.replace("[ext]", "d.ts"),
      format: "es"
    }
  }]
}