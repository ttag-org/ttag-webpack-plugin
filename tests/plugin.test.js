import path from "path";
import tmp from "tmp-promise";
import { getCompiler, runWebpack, readFile } from "./utils";
import TtagPlugin from "../plugin/index";

test("should apply translations to single entry point", async done => {
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
  dir.cleanup();
  done();
});

test("should apply translations to multiple entry point", async done => {
  const dir = await tmp.dir({ unsafeCleanup: true });

  const plugin = new TtagPlugin({
    translations: {
      uk: path.join(__dirname, "./fixtures/entry.uk.po")
    }
  });

  const compiler = getCompiler(plugin, {
    output: { path: dir.path },
    entry: {
      entry: [
        path.join(__dirname, "./fixtures/entry.js"),
        path.join(__dirname, "./fixtures/entry2.js")
      ]
    }
  });

  await runWebpack(compiler);
  const transFile = await readFile(path.join(dir.path, "entry.uk.js"));
  // const transFile2 = await readFile(path.join(dir.path, "entry2.uk.js"));
  expect(transFile).toContain("test translation [translated]");
  expect(transFile).toContain("test translation entry 2 [translated]");
  // dir.cleanup()
  done();
});
