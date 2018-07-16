const webpack = require('webpack')

module.exports = {
  entry: './src/client/index.js',
  output: {
    path: __dirname,
    filename: './public/app.js'
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /js$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader',
        query: {
          presets: ['react-app']
        }
      }
    ]
  }
}
