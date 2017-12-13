const path = require('path');

module.exports = {
  entry: {
    addInventory: "./src/addInventory.jsx",
  },
  output: {
    filename: "[name].entry.js",
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
    ],
  }
};
