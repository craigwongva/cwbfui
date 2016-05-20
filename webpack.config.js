'use strict'

const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  context: path.join(__dirname, 'app'),
  entry: './index.js',
  devtool: 'cheap-module-eval-source-map',

  resolve: {
    extensions: ['', '.js', '.jsx']
  },

  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },

  module: {
    noParse: /\/openlayers\/.*\.js$/,
    preLoaders: [
      {test: /\.jsx?$/, loader: 'eslint', exclude: /node_modules/}
    ],
    loaders: [
      {test: /\.jsx?$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.css$/, loader: 'style!css', include: /node_modules/},
      {test: /\.css$/, loader: 'style!css?module&localIdentName=[name]__[local]', exclude: /node_modules/},
      {test: /\.(png|jpg|gif)$/, loader: 'file'},
      {test: /\.(otf|eot|svg|ttf|woff)[^/]*$/, loader: 'file'}
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.GATEWAY': JSON.stringify(process.env.GATEWAY || 'http://localhost:3000')
    }),
    new HtmlWebpackPlugin({
      template: 'index.ejs',
      hash: true,
      xhtml: true
    }),
    new webpack.ProvidePlugin({fetch:'isomorphic-fetch'})
  ]
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = 'source-map'
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin())
}