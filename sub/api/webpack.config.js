//
// Copyright 2017 Alien Labs.
//

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {

  target: 'node',

  entry: './handler.js',

  // Copy static files to deployment (available locally to Lambda functions).
  // unzip -vl .serverless/web.zip
  plugins: [
    new CopyWebpackPlugin([
      {
        from: '../../config',
        to: 'config'
      }
    ])
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,    // Don't transpile deps.
        include: [
          path.resolve('.'),
          path.resolve(__dirname, '../api'),
          path.resolve(__dirname, '../db'),
          path.resolve(__dirname, '../db-core'),
          path.resolve(__dirname, '../node-util'),
          path.resolve(__dirname, '../util')
        ],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: './dist/babel-cache/'
          }
        }
      }
    ]
  }
};
