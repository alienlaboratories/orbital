//
// Copyright 2017 Alien Labs.
//

const CopyWebpackPlugin = require('copy-webpack-plugin');

// const slsw = require('serverless-webpack');

module.exports = {

  target: 'node',

  entry: './handler.js',

  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'views',
        to: 'views'
      },
      {
        from: 'static',
        to: 'static'
      }
    ])
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,    // Don't transpile deps.
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
