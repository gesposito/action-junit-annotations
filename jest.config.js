const { defaults } = require("jest-config");

module.exports = {
  reporters: [
    "default",
    [
      // https://github.com/jest-community/jest-junit
      "jest-junit",
      {
        outputDirectory: "test-results",
        outputName: "jest-junit.xml",
        // Template string for the name attribute of <testcase>.
        titleTemplate: "{filepath}",
      },
    ],
  ],
};
