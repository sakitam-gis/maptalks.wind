const serve = require('rollup-plugin-serve');
const { _package, banner } = require('./helper');
const baseConfig = require('./rollup-base-config');

baseConfig.plugins.push(// Default options
  serve({
    open: true,
    contentBase: [
      'examples', 'dist',
      'node_modules/maptalks/dist'
    ],
    host: 'localhost',
    port: 3003,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  })
);

module.exports = Object.assign(baseConfig, {
  output: [
    {
      file: _package.main,
      format: 'umd',
      name: _package.namespace,
      banner: banner,
      extend: true,
      globals: {
        'maptalks': 'maptalks'
      }
    },
    {
      file: _package.commonjs,
      format: 'cjs',
      banner: banner,
      extend: true,
      globals: {
        'maptalks': 'maptalks'
      }
    },
    {
      file: _package.module,
      format: 'es',
      banner: banner,
      extend: true,
      globals: {
        'maptalks': 'maptalks'
      }
    }
  ]
});
