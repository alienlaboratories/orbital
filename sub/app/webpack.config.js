//
// Copyright 2017 Alien Labs.
//

const path = require('path');

module.exports = {

  entry: {
    app: [
      'babel-polyfill',
      path.resolve(__dirname, './src/app.js')
    ]
  },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
    publicPath: '/assets/'            // Path for webpack-dev-server
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,      // Don't transpile deps.
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
