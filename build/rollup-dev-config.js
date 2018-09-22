const { input, output } = require('./rollup-base-config')[0];
module.exports = Object.assign({
  plugins: []
}, input, {output});
