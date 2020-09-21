const fs = require("fs").promises;
const util = require("util");

const core = require("@actions/core");
const github = require("@actions/github");

const parser = require("fast-xml-parser");
const merger = require("junit-report-merger");
const get = require("lodash/get");
const flattenDeep = require("lodash/flattenDeep");

const mergeFiles = util.promisify(merger.mergeFiles);

// most @actions toolkit packages have async methods
async function run() {
  try {
    const githubToken = core.getInput("github_token");
    const checkName = core.getInput("check_name");
    const reportPath = core.getInput("report_path");
    const reportFilename = core.getInput("report_filename");

    let fullPath;
    if (reportFilename) {
      fullPath = `${reportPath}${reportFilename}`;
    } else {
      fullPath = await mergeReports(reportPath);
    }
    const failingCases = await failingCasesFrom(fullPath);
    // suiteName

    if (failingCases.length) {
      core.info(`${failingCases.length} failures found`);

      const pullRequest = github.context.payload.pull_request;
      const head_sha =
        (pullRequest && pullRequest.head.sha) || github.context.sha;
      const annotations = annotationsFrom(failingCases);

      const octokit = github.getOctokit(githubToken);

      // https://docs.github.com/en/rest/reference/checks#create-a-check-run
      await octokit.checks.create({
        // owner
        // repo
        ...github.context.repo,
        // The name of the check. For example, "code-coverage"
        name: checkName || "Failures",
        // The SHA of the commit
        head_sha,
        // The current status. Can be one of queued, in_progress, or completed
        status: "completed",
        // The final conclusion of the check. Can be one of success, failure, neutral, cancelled, skipped, timed_out, or action_required
        conclusion: "failure",
        // Check runs can accept a variety of data in the output object, including a title and summary and can optionally provide descriptive details about the run
        output: {
          // The title of the check run
          title: "",
          // The summary of the check run. This parameter supports Markdown
          summary: "",
          // Adds information from your analysis to specific lines of code. Annotations are visible on GitHub in the Checks and Files changed tab of the pull request. The Checks API limits the number of annotations to a maximum of 50 per API request. To create more than 50 annotations, you have to make multiple requests
          annotations,
          // Adds images to the output displayed in the GitHub pull request UI
          // images: []
        },
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

async function mergeReports(reportPath, reportFilename = "merged.xml") {
  const fullPath = `${reportPath}${reportFilename}`;

  try {
    await fs.unlink(fullPath);
  } catch (error) {
    core.info(error);
  }

  const files = await (await fs.readdir(reportPath)).map(
    (filePath) => `${reportPath}/${filePath}`
  );
  await mergeFiles(fullPath, files, []);
  return fullPath;
}

async function failingCasesFrom(fullPath) {
  let XML;
  try {
    XML = await read(fullPath);
  } catch (error) {
    core.info(error);
    return [];
  }

  const options = {
    attributeNamePrefix: "",
    ignoreAttributes: false,
  };

  const json = parser.parse(XML, options);
  const testsuites = get(json, "testsuites");
  const failures = get(testsuites, "failures");

  let failingCases = [];
  if (Number(failures) > 0) {
    let failingSuites;

    if (Array.isArray(testsuites.testsuite)) {
      failingSuites = testsuites.testsuite.filter((ts) => {
        return Number(ts.failures) > 0;
      });
    } else {
      failingSuites =
        Number(testsuites.testsuite.failures) > 0 ? [testsuites.testsuite] : [];
    }
    failingCases = flattenDeep(
      failingSuites.map((ts) => {
        if (Array.isArray(ts.testcase)) {
          return ts.testcase
            .filter((tc) => tc.failure)
            .map((tc) => ({ ...tc, path: getPath(tc, ts) }));
        } else {
          const tc = ts.testcase;
          return tc.failure ? [{ ...tc, path: getPath(tc, ts) }] : [];
        }
      })
    );
  }

  return failingCases;
}

function getPath(tc, ts) {
  // Attempts to read path from `file` attribute either on `testcase` or parent `testsuite`
  // resorts to `name` on `testcase` as it's required
  return get(tc, "file", get(ts, "file", tc.name));
}

async function read(reportPath) {
  const data = await fs.readFile(reportPath, "binary");
  return data;
}

function annotationsFrom(failingCases) {
  return failingCases.map((fc) => {
    let message;
    if (typeof fc.failure === "string") {
      message = get(fc, "failure", "");
    } else {
      // Failure has either a text node or a `message` property, or both
      message = get(fc, "failure.#text", get(fc, "failure.message", ""));
    }
    return {
      // The path of the file to add an annotation to. For example, assets/css/main.css
      path: fc.path,
      // The start line of the annotation
      start_line: 0,
      // The end line of the annotation
      end_line: 0,
      // The level of the annotation. Can be one of notice, warning, or failure
      annotation_level: "failure",
      // A short description of the feedback for these lines of code. The maximum size is 64 KB
      message,
    };
  });
}

module.exports = {
  failingCasesFrom,
  annotationsFrom,
  mergeReports,
};
