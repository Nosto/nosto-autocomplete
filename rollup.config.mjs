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
  return [{
    plugins: [
      resolve(), 
      commonjs(),
      esbuild(),
      alias(aliasConfig)
    ],
    jsx: "react-jsx",
    input,
    output: [["mjs", "es"], ["cjs", "cjs"]].map(([ext, format]) => ({
      file: outputTemplate.replace("[ext]", ext),
      format,
      sourcemap: true,
    }))
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