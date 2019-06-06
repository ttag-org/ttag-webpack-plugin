import { makeFilename } from "../plugin/utils";

describe("makeFilename", () => {
  test("should replace locale in template", () => {
    expect(makeFilename("[name].[locale].js", "uk")).toEqual("[name].uk.js");
  });
});
