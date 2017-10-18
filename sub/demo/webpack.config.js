//
// Copyright 2017 Alien Labs.
//

// https://github.com/serverless-heaven/serverless-webpack
// https://github.com/serverless-heaven/serverless-webpack#node-modules--externals

const path = require('path');

module.exports = {

  target: 'node',

  entry: {
    'handler': [
      path.resolve(__dirname, './handler.js')
    ]
  },

  externals: {
    // 'aws-sdk': 'AWS'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,    // Don't transpile deps.
        include: [
          path.resolve('.')
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
