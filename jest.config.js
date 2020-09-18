const { defaults } = require("jest-config");

module.exports = {
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "test-results",
        outputName: "junit.xml",
        usePathForSuiteName: "true",
      },
    ],
  ],
};
