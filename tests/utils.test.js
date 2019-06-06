import { makeFilename, setTtagOptions } from "../plugin/utils";

describe("makeFilename", () => {
  test("should replace locale in template", () => {
    expect(makeFilename("[name].[locale].js", "uk")).toEqual("[name].uk.js");
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
