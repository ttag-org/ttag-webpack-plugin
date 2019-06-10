import deepcopy from "deepcopy";
const LOCALE_PLACEHOLDER = "[locale]";
const BABEL_LOADER_NAME = "babel-loader";

export function makeFilenameTpl(tpl, locale) {
  return tpl.replace(LOCALE_PLACEHOLDER, locale);
}

function isTtagPlugin(plugin) {
  return (
    plugin === "ttag" ||
    (Array.isArray(plugin) && plugin[0] === "ttag") ||
    plugin === "babel-plugin-ttag" ||
    (Array.isArray(plugin) && plugin[0] === "babel-plugin-ttag")
  );
}

export function applyTtagPlugin(options, ttagOpts) {
  const opts = deepcopy(options || {});
  opts.plugins = (opts.plugins || []).filter(p => !isTtagPlugin(p));
  opts.plugins.push(["babel-plugin-ttag", ttagOpts]);
  return opts;
}

export function setTtagOptions(compiler, ttagOpts) {
  const config = compiler.options;
  let hasBabelPlugin = false;
  if (!config.module) {
    config.module = { rules: [] };
  }
  if (!config.module.rules) {
    config.module.rules = [];
  }
  config.module.rules = config.module.rules.map(rule => {
    // if use is an array
    if (rule.use && Array.isArray(rule.use)) {
      rule.use = rule.use.map(loader => {
        if (typeof loader === "string") {
          if (loader.includes(BABEL_LOADER_NAME)) {
            const objRuleUse = {
              loader: loader,
              options: {}
            };
            objRuleUse.options = applyTtagPlugin(objRuleUse.options, ttagOpts);
            hasBabelPlugin = true;
            return objRuleUse;
          }
        } else if (loader.loader && loader.loader.includes(BABEL_LOADER_NAME)) {
          loader.options = applyTtagPlugin(loader.options, ttagOpts);
          hasBabelPlugin = true;
        }
        return loader;
      });
    }
    // if use is an object
    if (
      rule.use &&
      rule.use.loader &&
      rule.use.loader.includes(BABEL_LOADER_NAME)
    ) {
      rule.use.options = applyTtagPlugin(rule.use.options, ttagOpts);
      hasBabelPlugin = true;
    }
    return rule;
  });
  if (!hasBabelPlugin) {
    config.module.rules.push({
      test: /\.m?jsx?$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: "babel-loader",
        plugins: [["babel-plugin-ttag", ttagOpts]]
      }
    });
  }
}

export function getFilename(locale, outputOptions, options) {
  if (options.filename) return options.filename;
  if (outputOptions && outputOptions.filename) {
    if (outputOptions.filename.includes("[name]")) {
      return outputOptions.filename;
    } else {
      return outputOptions.filename.replace(/\.(\w+)$/, `-${locale}.$1`);
    }
  }
  return `[name]-${locale}.js`;
}

export function getChunkFilename(locale, outputOptions, options) {
  if (options.chunkFilename) return options.chunkFilename;
  if (outputOptions && outputOptions.chunkFilename) {
    if (outputOptions.chunkFilename.includes("[name]")) {
      return outputOptions.chunkFilename.replace("[name]", `[name]-${locale}`);
    } else {
      return outputOptions.chunkFilename.replace(/\.(\w+)$/, `-${locale}.$1`);
    }
  }
  return `[id].[name]-${locale}.js`;
}

export function makeEntrypoint(locale, entrypointName) {
  return `${entrypointName}-${locale}`;
}
