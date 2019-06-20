import { t } from "ttag";

async function test() {
  const mod = await import("./entry-async2");
  return mod;
}

console.log(t`test translation`);

test();
