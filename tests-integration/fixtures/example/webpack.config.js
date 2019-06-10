const path = require("path");
const TtagPlugin = require("../../../dist/index");
module.exports = {
  mode: "development",
  entry: {
    main: "./src/index.js"
  },
  output: {
    path: path.join(__dirname, "./dist")
  },
  devtool: "none",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: ["@babel/plugin-syntax-dynamic-import"]
          }
        }
      }
    ]
  },
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /node_modules|vendor/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  plugins: [
    new TtagPlugin({
      translations: {
        uk: path.join(__dirname, "./i18n/uk.po")
      }
    })
  ]
};
