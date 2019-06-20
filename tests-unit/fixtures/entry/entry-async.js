import { t } from "ttag";

async function test() {
  const mod = await import("./async-module");
  return mod;
}

console.log(t`test translation`);

test();
