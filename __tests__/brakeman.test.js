const { failingCasesFrom, annotationsFrom } = require("../index");

// Custom JUnit report built from Workflow jobs with
// https://github.com/gesposito/action-workflow-jobs-reporter

describe("Workflow report", () => {
  let failingCases;
  test("Converts JUnit XML to failing cases in JSON", async () => {
    failingCases = await failingCasesFrom("./test-results/brakeman.xml");
    expect(failingCases).toMatchSnapshot();
  });

  test("Converts failing cases in JSON to GitHub annotations", async () => {
    const annotations = annotationsFrom(failingCases);
    expect(annotations).toMatchSnapshot();
  });
});
