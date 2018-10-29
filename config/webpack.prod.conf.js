const path = require('path');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const base = require('./webpack.base.conf');

module.exports = merge(base, {
  mode   : 'production',
  output : {
    path       : path.resolve(__dirname, '../dist'),
    publicPath : '/',
    filename   : 'docx-to-pdf.js',
    libraryTarget: 'commonjs2'
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        cache     : true,
        parallel  : true,
        sourceMap : false 
      }),
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist'], { verbose: false })
  ]
});
