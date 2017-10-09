//
// Copyright 2017 Alien Labs.
//

const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// TODO(burdon): Copy defaults to root directory.

module.exports = {

  context: __dirname,

  target: 'web',

  // Source map shows original source and line numbers (and works with hot loader).
  // https://webpack.github.io/docs/configuration.html#devtool
  devtool: '#source-map',

  // https://webpack.js.org/configuration/dev-server/#devserver
  devServer: {
    contentBase: path.join(__dirname, 'testing'),
    compress: true,
    port: 9000
  },

  // https://webpack.js.org/configuration/resolve
  resolve: {

    extensions: ['.js'],

    // Resolve imports/requires.
    modules: [
      'node_modules'
    ]
  },

  entry: {
    'app': [
      path.resolve(__dirname, './src/demo/app.js')
    ]
  },

  output: {
    path: path.resolve(__dirname, './client/dist'),
    filename: '[name].bundle.js',
    publicPath: '/assets/'            // Path for webpack-dev-server
  },

  module: {
    rules: [

      // See .babelrc for the presets.
      // https://github.com/babel/babel-loader
      {
        test: /\.js$/,
        exclude: /node_modules/,      // Don't transpile deps.
        include: [
          path.resolve('.'),
          path.resolve(__dirname, '../api'),
          path.resolve(__dirname, '../util')
        ],
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: './dist/babel-cache/'
          }
        }
      },

      // https://github.com/webpack/json-loader
      {
        test: /\.json$/,
        use: {
          loader: 'json-loader'
        }
      },

      // https://github.com/webpack/css-loader
      {
        test: /\.css$/,
        use: {
          loader: 'css-loader'
        }
      },

      // https://github.com/webpack/less-loader
      {
        test: /\.less$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'less-loader']
        })
      }
    ]
  },


  // https://github.com/webpack/docs/wiki/list-of-plugins
  plugins: [

    // https://github.com/webpack/extract-text-webpack-plugin
    new ExtractTextPlugin('[name].css')
  ]
};
