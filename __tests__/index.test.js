const { failingCasesFrom } = require("../index");

describe("Not found report", () => {
  let failingCases;
  test("Does not return failing cases", async () => {
    failingCases = await failingCasesFrom("./test-results/junit-not-found.xml");
    expect(failingCases).toMatchSnapshot();
  });
});
