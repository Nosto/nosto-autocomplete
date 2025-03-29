import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import esbuild from "rollup-plugin-esbuild"
import dts from "rollup-plugin-dts"
import alias from '@rollup/plugin-alias'
import { string } from 'rollup-plugin-string'
import { visualizer } from "rollup-plugin-visualizer"

const preactAlias = alias({
  entries: [
    { find: 'react', replacement: 'preact/compat' },
    { find: 'react-dom', replacement: 'preact/compat' }
  ]
})

const external = [
  "react/jsx-runtime",
  "mustache",
  "liquidjs"
]

export default [
  ...createConfigs('src/index.ts', 'dist/autocomplete.[ext]'),
  ...createConfigs('src/react.ts', 'dist/preact/autocomplete.[ext]', preactAlias),
  ...createConfigs('src/react.ts', 'dist/react/autocomplete.[ext]'),
  ...createConfigs('src/liquid.ts', 'dist/liquid/autocomplete.[ext]'),
  ...createConfigs('src/mustache.ts', 'dist/mustache/autocomplete.[ext]'),
]

function createConfigs(input, outputTemplate, ...plugins) {
  return [
    createBuildConfig(input, outputTemplate, ...plugins),
    createDtsConfig(input, outputTemplate)
  ]
}

function createBuildConfig(input, outputTemplate, ...plugins) {
  return {
    plugins: [
      resolve(), 
      commonjs(),
      esbuild({
        minifyIdentifiers: true,
        minifySyntax: true,
      }),
      string({
        include: '**/*.{mustache,liquid}',
      }),
      visualizer(),
      ...plugins
    ],
    jsx: "react-jsx",
    external,
    input,
    output: [["mjs", "es"], ["cjs", "cjs"]].map(([ext, format]) => ({
      file: outputTemplate.replace("[ext]", ext),
      format,
      sourcemap: true,
    }))
  }
}

function createDtsConfig(input, outputTemplate) {
  return {
    plugins: [
      dts(),
      string({
        include: '**/*.{mustache,liquid}',
      })
    ],
    input,
    output: {
      file: outputTemplate.replace("[ext]", "d.ts"),
      format: "es"
    }
  }
}