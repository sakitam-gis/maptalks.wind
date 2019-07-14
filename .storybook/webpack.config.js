const path = require('path');
// const merge = require('webpack-merge');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// Export a function. Accept the base config as the only param.

module.exports = async ({ config, mode }) => {
  // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
  // You can change the configuration based on that.
  // 'PRODUCTION' is used when building the static version of storybook.

  // config.module.rules.push({
  //   test: /\.vue$/,
  //   loaders: [
  //     {
  //       loader: require.resolve('@storybook/addon-storysource/loader'),
  //       options: {
  //         // parser: 'typescript',
  //         // prettierConfig: {
  //         //   printWidth: 150,
  //         //   singleQuote: true,
  //         // },
  //       },
  //     }
  //   ],
  //   enforce: 'pre',
  // });

  // Return the altered config
  // Typescript support
  config.module.rules.push(
    {
      test: /\.(ts|tsx)$/,
      use: [
        {
          loader: 'cache-loader',
        },
        {
          loader: 'ts-loader',
          // loader: require.resolve('awesome-typescript-loader'),
          options: {
            // useCache: true,
            // configFileName: '../tsconfig.story.json',
            // context: path.resolve(__dirname, '../'),
            configFile: path.resolve(__dirname, '../tsconfig.story.json'),
            transpileOnly: true,
            appendTsSuffixTo: [
              '/\.vue$'
            ],
            happyPackMode: false
          }
        }
      ]
    }
  );

  config.module.rules.push({
    test: /\.less$/,
    use: ['style-loader', 'css-loader', 'less-loader'],
    include: path.resolve(__dirname, '../'),
  });

  config.module.rules.push({
    test: /\.glsl$/,
    loader: 'raw-loader'
  });

  config.resolve.extensions = [
    '.mjs',
    '.js',
    '.jsx',
    '.vue',
    '.json',
    '.wasm',
    '.ts',
    '.tsx'
  ];

  config.plugins.push(
    new ForkTsCheckerWebpackPlugin({
      vue: true,
      tslint: true,
      formatter: 'codeframe',
      checkSyntacticErrors: false
    })
  );

  return config;
};
