import {
  makeFilenameTpl,
  setTtagOptions,
  getFilename,
  getChunkFilename
} from "../plugin/utils";
import { isTSAnyKeyword } from "@babel/types";

describe("makeFilename", () => {
  test("should replace locale in template", () => {
    expect(makeFilenameTpl("[name].[locale].js", "uk")).toEqual("[name].uk.js");
  });
});

describe("setTtagOptions", () => {
  const babelUseAsArray = {
    test: /\.js$/,
    use: [
      {
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
    ]
  };

  test("should apply when use is array", () => {
    const compiler = {
      options: {
        module: {
          rules: [babelUseAsArray]
        }
      }
    };

    setTtagOptions(compiler, { resolve: { translations: "default" } });

    expect(JSON.stringify(compiler.options.module)).toContain(
      '{"resolve":{"translations":"default"}'
    );
  });
  const eslintLoader = {
    loader: "eslint-loader",
    options: { exclude: /node_modules/ }
  };

  const babelLoader = {
    loader: "babel-loader",
    options: {
      plugins: []
    }
  };

  const babelLoaders = ["thread-loader", babelLoader, eslintLoader];

  const nestedUseCase = {
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: babelLoaders
  };

  test("should apply when nested use", () => {
    const compiler = {
      options: {
        module: {
          rules: [nestedUseCase]
        }
      }
    };

    setTtagOptions(compiler, { resolve: { translations: "default" } });
    expect(JSON.stringify(compiler.options.module)).toContain(
      '{"resolve":{"translations":"default"}'
    );
  });

  const babelUseAsObject = {
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
  };

  test("should apply when use is object", () => {
    const compiler = {
      options: {
        module: {
          rules: [babelUseAsObject]
        }
      }
    };

    setTtagOptions(compiler, { resolve: { translations: "default" } });
    expect(JSON.stringify(compiler.options.module)).toContain(
      '{"resolve":{"translations":"default"}'
    );
  });

  const babelUseAsArrayString = {
    test: /\.js$/,
    use: ["babel-loader"]
  };

  test("should apply when use is array string", () => {
    const compiler = {
      options: {
        module: {
          rules: [babelUseAsArrayString]
        }
      }
    };

    setTtagOptions(compiler, { resolve: { translations: "default" } });
    expect(JSON.stringify(compiler.options.module)).toContain(
      '{"resolve":{"translations":"default"}'
    );
  });

  test("should apply when there is no babel loader at all", () => {
    const compiler = {
      options: {}
    };

    setTtagOptions(compiler, { resolve: { translations: "default" } });
    expect(JSON.stringify(compiler.options.module)).toContain(
      '{"resolve":{"translations":"default"}'
    );
  });
});

describe("getFilename", () => {
  it("should return modified filename if is set in original config", () => {
    const webpackOptions = {
      filename: "result.js"
    };
    const options = {};
    const result = getFilename("uk", webpackOptions, options);
    expect(result).toEqual("result-uk.js");
  });
  it("should return modified filename if is set in original config and has [name]", () => {
    const webpackOptions = {
      filename: "[name].js"
    };
    const options = {};
    const result = getFilename("uk", webpackOptions, options);
    expect(result).toEqual("[name].js");
  });
  it("should return defualt filename if is not set", () => {
    const webpackOptions = {};
    const options = {};
    const result = getFilename("uk", webpackOptions, options);
    expect(result).toEqual("[name]-uk.js");
  });
});

describe("getChunkFilename", () => {
  it("should return modified filename if is set in original config", () => {
    const webpackOptions = {
      chunkFilename: "[id].[name].js"
    };
    const options = {};
    const result = getChunkFilename("uk", webpackOptions, options);
    expect(result).toEqual("[id].[name]-uk.js");
  });
  it("should return defualt filename if is not set", () => {
    const webpackOptions = {};
    const options = {};
    const result = getChunkFilename("uk", webpackOptions, options);
    expect(result).toEqual("[id].[name]-uk.js");
  });
});
