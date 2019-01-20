module.exports = {
  presets: [
    ['@babel/env', {
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
      },
      loose: true,
      modules: false,
    }],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@babel/plugin-proposal-class-properties',
      { loose: true },
    ],
    '@babel/external-helpers',
  ],
  ignore: [
    'dist/*.js',
  ],
  comments: false,
};
