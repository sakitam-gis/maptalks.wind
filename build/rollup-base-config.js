// Config file for running Rollup in "normal" mode (non-watch)
const json = require('rollup-plugin-json');
const cjs = require('rollup-plugin-commonjs');
const nodeResolve = require('rollup-plugin-node-resolve');
const replace = require('rollup-plugin-replace');
const glslify = require('rollup-plugin-glslify');
const tslint = require('rollup-plugin-tslint');
const typescript = require('rollup-plugin-typescript2');
const { resolve } = require('./helper');

module.exports = {
  input: resolve('src/index.ts'),
  plugins: [
    ...(process.env.NODE_ENV ? [replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })] : []),
    json({
      include: resolve('package.json'),
      indent: ' '
    }),
    tslint({
      exclude: [
        'node_modules/**',
        'src/shaders/**'
      ]
    }),
    typescript({
      clean: true,
      tsconfig: 'tsconfig.json',
      useTsconfigDeclarationDir: true,
    }),
    glslify({ basedir: 'src/shaders' }),
    nodeResolve({
      mainFields: ['module', 'main'], // Default: ['module', 'main']
      browser: true,  // Default: false
      extensions: [ '.mjs', '.js', '.json', '.node', 'ts' ],  // Default: [ '.mjs', '.js', '.json', '.node' ]
      preferBuiltins: true,  // Default: true
    }),
    cjs(),
  ],
  external: [
    'maptalks'
  ]
};
