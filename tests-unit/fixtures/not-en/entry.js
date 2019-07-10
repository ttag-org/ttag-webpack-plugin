import { ngettext, msgid } from "ttag";

const n = 7;
console.log(
  ngettext(msgid`${n} продукт`, `${n} продукта`, `${n} продуктов`, n)
);
