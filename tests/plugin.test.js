import path from "path";
import tmp from "tmp-promise";
import { getCompiler, runWebpack, readFile } from "./utils";
import TtagPlugin from "../plugin/index";

test("should apply translations", async done => {
  const dir = await tmp.dir({ unsafeCleanup: true });

  const plugin = new TtagPlugin({
    translations: {
      uk: path.join(__dirname, "./fixtures/entry.uk.po")
    }
  });

  const compiler = getCompiler(plugin, {
    output: { path: dir.path },
    entry: { entry: path.join(__dirname, "./fixtures/entry.js") }
  });

  await runWebpack(compiler);
  const transFile = await readFile(path.join(dir.path, "entry.uk.js"));
  expect(transFile).toContain("test translation [translated]");
  done();
});
