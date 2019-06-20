
# ttag-webpack-plugin 
> status: beta

Add this plugin to generate localized build for each locale. This plugin will apply `babel-ttag-plugin` with appropriate settings for each locale

> Works with Webpack4 and Babel7

## Installation
```
npm i -D ttag-webpack-plugin babel-plugin-ttag
```

### Note
This plugin only works when you're already using `babel-loader`.


## Options
```js
new TtagPlugin({
  translations: {
   <locale>: <path to the .po file>
  },
  filename: '[name].[locale].js',
  chunkFilename: '[id].[locale].js',
  excludedPlugins: [...],
});
```
1. `translations`: Map of po files for locales
2. `filename` (optional): Output name of localized bundles. (default: '[name]-[locale].js')
3. `chunkFilename` (optional): Output name of localized chunks. (default: '[id].[name]-[locale].js')
4. `excludedPlugins` (optional): List of plugins you want to exclude from generating localized bundles.

## Without this plugin
A usual output from webpack output looks like this:
![ES5 output]()

## With this plugin
With this plugin added, you will be generating localized outputs:
![ES5 output]()

## How to use
```js
const path = require("path");
const TtagPlugin = require("ttag-webpack-plugin");

module.exports = {
  entry: {
    main: "./src/index.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader' 
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
```
See example - https://github.com/ttag-org/ttag-webpack-plugin/tree/master/tests-integration/fixtures/example
