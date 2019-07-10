import path from "path";
import tmp from "tmp-promise";
import { getCompiler, runWebpack, readFile } from "./utils";
import TtagPlugin from "../plugin/index";

test("should not apply default plural forms for other defautl lang", async done => {
  const dir = await tmp.dir({ unsafeCleanup: true });

  const plugin = new TtagPlugin({
    ttag: {
      defaultLang: "ru"
    },
    translations: {
      uk: path.join(__dirname, "./fixtures/not-en/main.uk.po")
    }
  });

  const compiler = getCompiler(plugin, {
    output: { path: dir.path },
    entry: { entry: path.join(__dirname, "./fixtures/not-en/entry.js") }
  });

  await runWebpack(compiler);
  const transFile = await readFile(path.join(dir.path, "entry.js"));
  expect(transFile).not.toContain("n != 1"); // should not apply default plural forms
  dir.cleanup();
  done();
});
