//
// Copyright 2017 Alien Labs.
//

// const slsw = require('serverless-webpack');

module.exports = {

  target: 'node',

  entry: './handler.js',

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
