import webpack from "webpack";
import deepcopy from "deepcopy";
import fs from "fs";
import { NONAME } from "dns";

const defaultConfig = {
  mode: "development",
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["last 2 versions"]
                  }
                }
              ]
            ]
          }
        }
      }
    ]
  },
  plugins: [],
  optimization: {
    minimize: false
  }
};

export const getCompiler = (ttagPluging, webpackConf = {}) => {
  const config = deepcopy(Object.assign({}, defaultConfig, webpackConf));
  config.plugins.unshift(ttagPluging);
  return webpack(config);
};

export const runWebpack = async compiler => {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err || (stats && stats.hasErrors())) {
        reject(stats.toString("normal"));
      }
      resolve(stats);
    });
  });
};

export function readFile(filepath) {
  return new Promise((res, rej) => {
    fs.readFile(filepath, (err, data) => {
      if (err) {
        rej(err);
        return;
      }
      res(data.toString());
    });
  });
}
