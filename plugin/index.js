import deepcopy from "deepcopy";
import SingleEntryPlugin from "webpack/lib/SingleEntryPlugin";
import MultiEntryPlugin from "webpack/lib/MultiEntryPlugin";
import SplitChunksPlugin from "webpack/lib/optimize/SplitChunksPlugin";
import JsonpTemplatePlugin from "webpack/lib/web/JsonpTemplatePlugin";
import { makeFilename } from "./utils";

const PLUGIN_NAME = "TtagPlugin";
const BABEL_LOADER_NAME = "babel-loader";

class TtagPlugin {
  constructor(options = {}) {
    // Define compilation name and output name
    this.options_ = Object.assign(
      {
        translations: {},
        filename: "[name].[locale].js",
        chunkFilename: "[id].[locale].js",
        excludedPlugins: [PLUGIN_NAME],
        additionalPlugins: []
      },
      options
    );
  }

  initChildCompiler(compiler, locale, pofilePath) {
    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const outputOptions = deepcopy(compiler.options);
      this.babelLoaderConfigOptions_ = this.getBabelLoaderOptions(
        outputOptions
      );
      this.newConfigOptions_ = this.makeTtagOptions(
        this.babelLoaderConfigOptions_,
        pofilePath
      );
      outputOptions.output.filename = makeFilename(
        this.options_.filename,
        locale
      );
      outputOptions.output.chunkFilename = makeFilename(
        this.options_.chunkFilename,
        locale
      );
      // Only copy over mini-extract-text-plugin (excluding it breaks extraction entirely)
      let plugins = (compiler.options.plugins || []).filter(
        c => this.options_.excludedPlugins.indexOf(c.constructor.name) < 0
      );

      // Add the additionalPlugins
      plugins = plugins.concat(this.options_.additionalPlugins);

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

      // Call the `apply` method of all plugins by ourselves.
      if (Array.isArray(plugins)) {
        for (const plugin of plugins) {
          plugin.apply(childCompiler);
        }
      }

      if (typeof compiler.options.entry === "string") {
        new SingleEntryPlugin(
          compiler.context,
          compiler.options.entry,
          "main"
        ).apply(childCompiler);
      } else {
        Object.keys(compiler.options.entry).forEach(entry => {
          const entryFiles = compiler.options.entry[entry];
          if (Array.isArray(entryFiles)) {
            new MultiEntryPlugin(compiler.context, entryFiles, entry).apply(
              childCompiler
            );
          } else {
            new SingleEntryPlugin(compiler.context, entryFiles, entry).apply(
              childCompiler
            );
          }
        });
      }

      // Convert entry chunk to entry file
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
          let babelLoader;
          childCompiler.options.module.rules.forEach((rule, index) => {
            babelLoader = this.getBabelLoader(childCompiler.options);
            babelLoader.options = this.newConfigOptions_;
          });

          this.options_.beforeStartExecution &&
            this.options_.beforeStartExecution(
              plugins,
              (babelLoader || {}).options
            );

          childCompiler.runAsChild((err, entries, childCompilation) => {
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
    Object.entries(this.options_.translations).forEach(
      ([locale, pofilePath]) => {
        this.initChildCompiler(compiler, locale, pofilePath);
      }
    );
  }

  makeTtagOptions(options, pofilePath) {
    options = options || {};
    options.presets = options.presets || [];
    const ttagOpts = ["ttag", { resolve: { translations: pofilePath } }];
    options.plugins = options.plugins || [];
    options.plugins.push(ttagOpts);
    return options;
  }

  addDefaultResolve(options) {
    options = options || {};
    options.presets = options.presets || [];
    const ttagOpts = ["ttag", { resolve: { translations: "default" } }];
    options.plugins = options.plugins || [];
    options.plugins.push(ttagOpts);
    return options;
  }

  getBabelLoader(config) {
    let babelConfig = null;
    config.module.rules.forEach(rule => {
      if (!babelConfig) {
        if (rule.use && Array.isArray(rule.use)) {
          rule.use.forEach(rule => {
            if (rule.loader.includes(BABEL_LOADER_NAME)) {
              babelConfig = rule;
            }
          });
        } else if (
          (rule.use &&
            rule.use.loader &&
            rule.use.loader.includes(BABEL_LOADER_NAME)) ||
          rule.loader.includes(BABEL_LOADER_NAME)
        ) {
          babelConfig = rule.use || rule;
        }
      }
    });
    if (!babelConfig) {
      throw new Error("Babel-loader config not found!!!");
    } else {
      return babelConfig;
    }
  }

  getBabelLoaderOptions(config) {
    return deepcopy(this.getBabelLoader(config).options);
  }
}

export default TtagPlugin;
