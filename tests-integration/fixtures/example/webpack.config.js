const path = require("path");
const TtagPlugin = require("../../../dist/index").default;
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
  plugins: [
    new TtagPlugin({
      translations: {
        uk: path.join(__dirname, "./i18n/uk.po")
      }
    })
  ]
};
