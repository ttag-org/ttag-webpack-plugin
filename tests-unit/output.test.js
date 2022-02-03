import path from "path";
import tmp from "tmp-promise";
import { getCompiler, runWebpack, readFile } from "./utils";
import TtagPlugin from "../plugin/index";

test("should modify existing filename", async done => {
  const dir = await tmp.dir({ unsafeCleanup: true });
  const plugin = new TtagPlugin({
    translations: {
      uk: path.join(__dirname, "./fixtures/entry/entry.uk.po")
    }
  });

  const compiler = getCompiler(plugin, {
    output: {
      path: dir.path,
      filename: "js/[name].js"
    },
    entry: { entry: path.join(__dirname, "./fixtures/entry/entry.js") }
  });

  await runWebpack(compiler);
  const transFile = await readFile(path.join(dir.path, "js/entry-uk.js"));
  expect(transFile).toContain("test translation [translated]");
  done();
});

test("should add vendor chunks from child compilation", async done => {
  const dir = await tmp.dir({ unsafeCleanup: true });
  const plugin = new TtagPlugin({
    translations: {
      uk: path.join(__dirname, "./fixtures/entry/entry.uk.po")
    }
  });

  const compiler = getCompiler(plugin, {
    output: {
      path: dir.path,
      filename: "js/[name].js"
    },
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
    entry: { entry: path.join(__dirname, "./fixtures/entry/entry-async.js") },
    optimization: {
      runtimeChunk: true,
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /node_modules/,
            name: "vendors",
            chunks: "all"
          }
        }
      }
    }
  });

  const stats = await runWebpack(compiler);
  const chunkNames = Array.from(stats.compilation.chunks).map(ch => ch.name);
  expect(chunkNames).toContain("vendors-uk");
  done();
});
