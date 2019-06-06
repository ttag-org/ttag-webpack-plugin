import path from "path";
import tmp from "tmp-promise";
import { getCompiler, runWebpack, readFile } from "./utils";
import TtagPlugin from "../plugin/index";

test("should apply translations when entry is an object", async done => {
  const dir = await tmp.dir({ unsafeCleanup: true });

  const plugin = new TtagPlugin({
    translations: {
      uk: path.join(__dirname, "./fixtures/entry/entry.uk.po")
    }
  });

  const compiler = getCompiler(plugin, {
    output: { path: dir.path },
    entry: { entry: path.join(__dirname, "./fixtures/entry/entry.js") }
  });

  await runWebpack(compiler);
  const transFile = await readFile(path.join(dir.path, "entry.uk.js"));
  expect(transFile).toContain("test translation [translated]");
  dir.cleanup();
  done();
});

test("should apply translations when entry is array", async done => {
  const dir = await tmp.dir({ unsafeCleanup: true });

  const plugin = new TtagPlugin({
    translations: {
      uk: path.join(__dirname, "./fixtures/entry/entry.uk.po")
    }
  });

  const compiler = getCompiler(plugin, {
    output: { path: dir.path },
    entry: {
      entry: [
        path.join(__dirname, "./fixtures/entry/entry.js"),
        path.join(__dirname, "./fixtures/entry/entry2.js")
      ]
    }
  });

  await runWebpack(compiler);
  const transFile = await readFile(path.join(dir.path, "entry.uk.js"));
  expect(transFile).toContain("test translation [translated]");
  expect(transFile).toContain("test translation entry 2 [translated]");
  dir.cleanup();
  done();
});

test("should apply translations when entry is a string", async done => {
  const dir = await tmp.dir({ unsafeCleanup: true });
  const plugin = new TtagPlugin({
    translations: {
      uk: path.join(__dirname, "./fixtures/entry/entry.uk.po")
    }
  });

  const compiler = getCompiler(plugin, {
    output: { path: dir.path },
    entry: path.join(__dirname, "./fixtures/entry/entry.js")
  });

  await runWebpack(compiler);
  const transFile = await readFile(path.join(dir.path, "main.uk.js"));
  expect(transFile).toContain("test translation [translated]");
  dir.cleanup();
  done();
});

// test("should resolve default for the original entry", async done => {
//   const dir = await tmp.dir({ unsafeCleanup: true });
//   const plugin = new TtagPlugin({
//     translations: {
//       uk: path.join(__dirname, "./fixtures/entry/entry.uk.po")
//     }
//   });

//   const compiler = getCompiler(plugin, {
//     output: { path: dir.path },
//     entry: {
//       entry: path.join(__dirname, "./fixtures/entry/entry.js")
//     }
//   });

//   await runWebpack(compiler);
//   const originalFile = await readFile(path.join(dir.path, "entry.js"));
//   expect(originalFile).toContain('console.log("test translation")');
//   done();
// });
