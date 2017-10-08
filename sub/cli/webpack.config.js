//
// Copyright 2017 Alien Labs.
//

const path = require('path');

module.exports = {

  target: 'node',

  entry: {
    orb: [
      path.resolve(__dirname, './src/main.js')
    ],

    sanity: [
      path.resolve(__dirname, './src/sanity.js')
    ]
  },

  // TODO(burdon): orb.js (bin) has errors when importing (require) bundle.

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,      // Don't transpile deps.
        include: [
          path.resolve('.'),
          path.resolve('../util')
        ],
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
