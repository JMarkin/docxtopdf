const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base.conf');


module.exports = merge(base, {
  mode    : 'development',
  devtool : 'eval-source-map',
  output  : {
    filename   : 'app.js',
    publicPath : '/'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
});
