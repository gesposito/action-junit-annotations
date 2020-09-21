const { failingCasesFrom, annotationsFrom } = require("../index");

describe("Flat Jest report", () => {
  test("Converts Jest JUnit XML to GitHub annotations", async () => {
    const failingCases = await failingCasesFrom(
      "./test-results/jest-junit-failure.xml"
    );
    expect(failingCases).toMatchSnapshot();

    const annotations = annotationsFrom(failingCases);
    expect(annotations).toMatchSnapshot();
  });
});

describe("Nested Jest report", () => {
  let failingCases;
  test("Converts Jest JUnit XML to failing cases in JSON", async () => {
    failingCases = await failingCasesFrom(
      "./test-results/jest-junit-nested-failure.xml"
    );
    expect(failingCases).toMatchSnapshot();
  });

  test("Converts Jest failing cases in JSON to GitHub annotations", async () => {
    const annotations = annotationsFrom(failingCases);
    expect(annotations).toMatchSnapshot();
  });
});
