import deepcopy from "deepcopy";
import SplitChunksPlugin from "webpack/lib/optimize/SplitChunksPlugin";
import JsonpTemplatePlugin from "webpack/lib/web/JsonpTemplatePlugin";
import {
  makeEntrypoint,
  setTtagOptions,
  getFilename,
  getChunkFilename
} from "./utils";

let EntryPlugin;
let SingleEntryPlugin;
let MultiEntryPlugin;

try {
  // webpack 5
  EntryPlugin = require("webpack/lib/EntryPlugin");
} catch (e) {
  // webpack 4
  SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
  MultiEntryPlugin = require("webpack/lib/MultiEntryPlugin");
}

const PLUGIN_NAME = "TtagPlugin";

class TtagPlugin {
  constructor(options = {}) {
    // Define compilation name and output name
    this.options = Object.assign(
      {
        ttag: {},
        translations: {},
        filename: undefined,
        chunkFilename: undefined,
        excludedPlugins: []
      },
      options
    );
  }

  initChildCompiler(compiler, locale, pofilePath) {
    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const outputOptions = deepcopy(compiler.options);

      outputOptions.output.filename = getFilename(
        locale,
        compiler.options.output,
        this.options
      );

      outputOptions.output.chunkFilename = getChunkFilename(
        locale,
        compiler.options.output,
        this.options
      );

      // Only copy over mini-extract-text-plugin (excluding it breaks extraction entirely)
      let plugins = (compiler.options.plugins || []).filter(
        c =>
          this.options.excludedPlugins.indexOf(c.constructor.name) < 0 &&
          c.constructor.name !== PLUGIN_NAME
      );

      /**
       * We are deliberatly not passing plugins in createChildCompiler.
       * All webpack does with plugins is to call `apply` method on them
       * with the childCompiler.
       * But by then we haven't given childCompiler a fileSystem or other options
       * which a few plugins might expect while execution the apply method.
       * We do call the `apply` method of all plugins by ourselves later in the code
       */
      const childCompiler = compilation.createChildCompiler(
        PLUGIN_NAME,
        outputOptions.output
      );

      childCompiler.context = compiler.context;
      childCompiler.inputFileSystem = compiler.inputFileSystem;
      childCompiler.outputFileSystem = compiler.outputFileSystem;
      childCompiler.options.module = deepcopy(compiler.options.module);
      this.addResolveOpts(childCompiler, pofilePath);

      // Call the `apply` method of all plugins by ourselves.
      if (Array.isArray(plugins)) {
        for (const plugin of plugins) {
          plugin.apply(childCompiler);
        }
      }

      this.applyEntryPlugin(compiler, childCompiler, locale);

      // The next line makes async chunks work (do not remove that)
      new JsonpTemplatePlugin().apply(childCompiler);

      if (compiler.options.optimization) {
        if (compiler.options.optimization.splitChunks) {
          new SplitChunksPlugin(
            Object.assign({}, compiler.options.optimization.splitChunks)
          ).apply(childCompiler);
        }
      }

      compilation.hooks.additionalAssets.tapAsync(
        PLUGIN_NAME,
        childProcessDone => {
          childCompiler.runAsChild((err, entries, childCompilation) => {
            // name split-chunks with locale
            compilation.chunks = compilation.chunks.concat(
              childCompilation.chunks.map(ch => {
                if (
                  ch.chunkReason &&
                  ch.chunkReason.startsWith("split chunk")
                ) {
                  ch.name = makeEntrypoint(locale, ch.name);
                }
                return ch;
              })
            );
            if (!err) {
              compilation.assets = Object.assign(
                childCompilation.assets,
                compilation.assets
              );
              compilation.namedChunkGroups = Object.assign(
                childCompilation.namedChunkGroups,
                compilation.namedChunkGroups
              );
            }
            err && compilation.errors.push(err);
            childProcessDone();
          });
        }
      );
      callback();
    });
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync(PLUGIN_NAME, (compiler, callback) => {
      this.addResolveOpts(compiler);
      callback();
    });
    Object.entries(this.options.translations).forEach(
      ([locale, pofilePath]) => {
        this.initChildCompiler(compiler, locale, pofilePath);
      }
    );
  }

  applyEntryPlugin(compiler, childCompiler, locale) {
    if (EntryPlugin) {
      // webpack 5
      Object.keys(compiler.options.entry).forEach(entry => {
        const entryFiles = compiler.options.entry[entry].import;

        entryFiles.forEach(ent => {
          new EntryPlugin(compiler.context, ent, {
            name: makeEntrypoint(locale, entry)
          }).apply(childCompiler);
        });
      });
    } else {
      // webpack 4
      if (typeof compiler.options.entry === "string") {
        new SingleEntryPlugin(
          compiler.context,
          compiler.options.entry,
          makeEntrypoint(locale, "main")
        ).apply(childCompiler);
      } else {
        Object.keys(compiler.options.entry).forEach(entry => {
          const entryFiles = compiler.options.entry[entry];

          if (Array.isArray(entryFiles)) {
            new MultiEntryPlugin(
              compiler.context,
              entryFiles,
              makeEntrypoint(locale, entry)
            ).apply(childCompiler);
          } else {
            new SingleEntryPlugin(
              compiler.context,
              entryFiles,
              makeEntrypoint(locale, entry)
            ).apply(childCompiler);
          }
        });
      }
    }
  }

  addResolveOpts(compiler, pofilePath = "default") {
    const ttagOpts = deepcopy(this.options.ttag);
    if (!ttagOpts.resolve) {
      ttagOpts.resolve = {};
    }
    ttagOpts.resolve.translations = pofilePath;
    setTtagOptions(compiler, ttagOpts);
  }
}

// little hack to make work:
// const TtagPlugin = require('..')
module.exports = TtagPlugin;
