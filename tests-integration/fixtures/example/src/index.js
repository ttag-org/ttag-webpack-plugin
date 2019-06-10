import { t } from "ttag";

import v1 from "./vendor1";
import v2 from "./vendor2";

__webpack_public_path__ = "/dist/";
t`test`;

async function start() {
  const { module1 } = await import("./module1");
  const { module2 } = await import("./module2");
  const html = `
  <h2>${module1()}</h2>
  <h2>${module2()}</h2>
  <h2>${v1()}</h2>
  <h2>${v2()}</h2>
  `;
  const content = document.getElementById("content");
  content.innerHTML = html;
}

start();
