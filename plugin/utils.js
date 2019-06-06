import fs from "fs";

const LOCALE_PLACEHOLDER = "[locale]";

export function makeFilename(tpl, locale) {
  return tpl.replace(LOCALE_PLACEHOLDER, locale);
}
