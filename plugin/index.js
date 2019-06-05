const SingleEntryPlugin = require("webpack/lib/SingleEntryPlugin");
const MultiEntryPlugin = require('webpack/lib/MultiEntryPlugin');
const SplitChunksPlugin = require('webpack/lib/optimize/SplitChunksPlugin');
const JsonpTemplatePlugin = require('webpack/lib/web/JsonpTemplatePlugin');

const deepcopy = require('deepcopy');

const PLUGIN_NAME = "TtagPlugin";
const BABEL_LOADER_NAME = 'babel-loader';

class TtagPlugin {
  constructor() {
    // Define compilation name and output name
    this.options_ = {
      filename: "[name].ttag.js",
      chunkFilename: "[id].ttag.js",
      additionalPlugins: [],
      excludedPlugins: [PLUGIN_NAME],
    };
  }

  apply(compiler) {
    compiler.hooks.make.tapAsync(PLUGIN_NAME, (compilation, callback) => {
      const outputOptions = deepcopy(compiler.options);
      this.babelLoaderConfigOptions_ = this.getBabelLoaderOptions(outputOptions);
      this.newConfigOptions_ = this.babelLoaderConfigOptions_; // TODO add ttag
      // this.newConfigOptions_ = this.makeESMPresetOptions(this.babelLoaderConfigOptions_);
      outputOptions.output.filename = this.options_.filename;
      outputOptions.output.chunkFilename = this.options_.chunkFilename;
      
      let plugins = (compiler.options.plugins || []).filter(c => this.options_.excludedPlugins.indexOf(c.constructor.name) < 0);

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
      childCompiler.options.module = compiler.options.module

      // Call the `apply` method of all plugins by ourselves.
      if (Array.isArray(plugins)) {
        for (const plugin of plugins) {
          plugin.apply(childCompiler);
        }
      }

      // TODO: handle if entry is a string
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

      // Convert entry chunk to entry file
      new JsonpTemplatePlugin().apply(childCompiler);

      if (compiler.options.optimization) {
        if (compiler.options.optimization.splitChunks) {
          new SplitChunksPlugin(
            Object.assign(
              {},
              compiler.options.optimization.splitChunks,
            )
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
          console.log('running childCompiler');
          childCompiler.runAsChild((err, entries, childCompilation) => {
            console.log('here');
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
        } else if ((rule.use && rule.use.loader && rule.use.loader.includes(BABEL_LOADER_NAME)) || rule.loader.includes(BABEL_LOADER_NAME)) {
          babelConfig = rule.use || rule;
        }
      }
    });
    if (!babelConfig) {
      throw new Error('Babel-loader config not found!!!');
    } else {
      return babelConfig;
    }
  }

  getBabelLoaderOptions(config) {
    return deepcopy(this.getBabelLoader(config).options);
  }
}

module.exports = TtagPlugin;
