const { failingCasesFrom, annotationsFrom } = require("../index");

describe("Nested Cypress report", () => {
  let failingCases;
  test("Converts JUnit XML to failing cases in JSON", async () => {
    failingCases = await failingCasesFrom(
      "./test-results/cypress-junit-failure.xml"
    );
    expect(failingCases).toMatchSnapshot();
  });

  test("Converts failing cases in JSON to GitHub annotations", async () => {
    const annotations = annotationsFrom(failingCases);
    expect(annotations).toMatchSnapshot();
  });
});
