const path = require("path")
const TtagPlugin = require("./plugin");

module.exports = {
  context: __dirname + "/src-example",
  entry: {
    index: "./index"
  },
  output: {
    path: __dirname + "/dist",
    filename: "bundle.js"
  },
  devtool: "none",
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new TtagPlugin({
      translations: {
        uk: path.join(__dirname, './i18n/uk.po')
      }
    })
  ]
}
