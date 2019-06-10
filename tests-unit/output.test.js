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
