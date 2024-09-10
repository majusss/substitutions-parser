import * as fs from "fs";
import * as path from "path";
import SubstitutionPage from "../lib/substitutions";

describe("Substitution Test", () => {
  const indexFilename = path.join(__dirname, "fixtures", "index.html");
  const indexHTML = fs.readFileSync(indexFilename, {
    encoding: "utf8",
  });
  it("Cheerio init", () => {
    expect(() => new SubstitutionPage(indexHTML)).not.toThrow();
  });
  const substitutions = new SubstitutionPage(indexHTML);
  it("Substitution", () => {
    const expectedFilename = path.join(__dirname, "expected", "example.json");
    const expectedJSON = fs.readFileSync(expectedFilename, {
      encoding: "utf8",
    });
    const expectedValues = JSON.parse(expectedJSON);
    expect(substitutions.parseSubstitutionSite()).toEqual(expectedValues);
  });
});
