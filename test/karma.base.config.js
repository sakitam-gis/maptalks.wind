// Karma configuration
// Generated on Sun Jun 02 2019 15:47:55 GMT+0800 (GMT+08:00)
const baseConfig = require('../build/rollup-base-config');

console.log(baseConfig);

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'expect', 'jasmine', 'karma-typescript'],


    // list of files / patterns to load in the browser
    files: [
      // '../node_modules/maptalks/**/*.js',
      // { pattern: '../src/**/!(main)*.+(ts|tsx)' },
      '../src/**/*.ts', '../test/**/*.ts'
    ],


    // list of files / patterns to exclude
    exclude: [],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '../node_modules/maptalks/**/*.js': ['rollup'],
      // '../src/**/!(main)*.+(ts|tsx)': ['karma-typescript'],
      '../src/**/*.ts': ['rollup', 'coverage'],
      // '../test/**/*.ts': ['karma-typescript'],
    },

    // karmaTypescriptConfig: {
    //   compilerOptions: {
    //     // allowJs: true,
    //     emitDecoratorMetadata: true,
    //     experimentalDecorators: true,
    //     module: "commonjs",
    //     sourceMap: true,
    //     target: "ES5",
    //     lib: [
    //       "es5",
    //       "es6",
    //       "dom"
    //     ],
    //   },
    // },

    rollupPreprocessor: Object.assign(baseConfig, {
      output: {
        file: 'maptalks.wind.js',
        format: 'umd',
        name: 'maptalks',
        extend: true,
        globals: {
          'maptalks': 'maptalks'
        }
      },
    }),


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    // reporters: ['progress', 'coverage', 'karma-typescript'],
    reporters: ['progress', 'coverage'],
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
      instrumenterOptions: {
        istanbul: { noCompact: true }
      }
    },


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    // How long does Karma wait for a browser to reconnect (in ms).
    browserDisconnectTimeout: 5000,


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
};
