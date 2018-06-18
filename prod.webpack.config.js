const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    itemList: "./src/itemList.jsx"
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.optimize.UglifyJsPlugin()
  ],
  output: {
    filename: "[name].prod.js",
    path: path.resolve(__dirname, "dist")
  },
  module:{
    rules:[
      {
          loader: "babel-loader",
          test: [
            /\.jsx?$/,
          ],
          include: [
            path.resolve(__dirname, "src"),
          ],
          exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  }
};
