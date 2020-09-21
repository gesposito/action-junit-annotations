const { defaults } = require("jest-config");

module.exports = {
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "test-results",
        outputName: "jest-junit.xml",
        usePathForSuiteName: "true",
      },
    ],
  ],
};
