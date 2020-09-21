const { failingCasesFrom, annotationsFrom, mergeReports } = require("../index");

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

describe("Multiple Cypress reports", () => {
  let failingCases;
  test("Converts JUnit XML to failing cases in JSON", async () => {
    const reportPath = "./test-results/cypress-results/";
    const mergedPath = await mergeReports(reportPath);
    failingCases = await failingCasesFrom(mergedPath);
    expect(failingCases).toMatchSnapshot();
  });

  test("Converts failing cases in JSON to GitHub annotations", async () => {
    const annotations = annotationsFrom(failingCases);
    expect(annotations).toMatchSnapshot();
  });
});
