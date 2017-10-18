//
// Copyright 2017 Alien Labs.
//

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// const slsw = require('serverless-webpack');

module.exports = {

  target: 'node',

  entry: {
    'handler': [
      path.resolve(__dirname, './handler.js')
    ]
  },

  // Copy static files to deployment (available locally to Lambda functions).
  // unzip -vl .serverless/web.zip
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
