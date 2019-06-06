import deepcopy from "deepcopy";

const LOCALE_PLACEHOLDER = "[locale]";
const BABEL_LOADER_NAME = "babel-loader";

export function makeFilename(tpl, locale) {
  return tpl.replace(LOCALE_PLACEHOLDER, locale);
}

export function applyTtagPlugin(options, ttagOpts) {
  const opts = deepcopy(options || {});
  opts.plugins = (opts.plugins || []).filter(
    p => p !== "ttag" && (Array.isArray(p) ? p[0] !== "ttag" : true)
  );
  opts.plugins.push(["ttag", ttagOpts]);
  return opts;
}

export function setTtagOptions(compiler, ttagOpts) {
  const config = compiler.options;
  config.module.rules = config.module.rules.map(rule => {
    // if use is an array
    if (rule.use && Array.isArray(rule.use)) {
      rule.use = rule.use.map(ruleUse => {
        if (
          typeof ruleUse === "string" &&
          ruleUse.includes(BABEL_LOADER_NAME)
        ) {
          const objRuleUse = {
            loader: ruleUse,
            options: {}
          };
          objRuleUse.options = applyTtagPlugin(objRuleUse.options, ttagOpts);
          return objRuleUse;
        } else if (ruleUse.loader.includes(BABEL_LOADER_NAME)) {
          ruleUse.options = applyTtagPlugin(ruleUse.options, ttagOpts);
        }
        return ruleUse;
      });
    }
    // if use is an object
    if (
      rule.use &&
      rule.use.loader &&
      rule.use.loader.includes(BABEL_LOADER_NAME)
    ) {
      rule.use.options = applyTtagPlugin(rule.use.options, ttagOpts);
    }
    return rule;
  });
  return compiler;
}
