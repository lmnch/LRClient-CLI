const { expect, test } = require("@oclif/test");
const { assert } = require("chai");

const expectNextLineToBe = (outputLines, expected) => {
  expect(outputLines.length).to.be.gte(1);
  if (expected !== undefined) {
    const output = outputLines[0];
    expect(output).to.be.eq(expected);
  }
  outputLines.shift();
};

/**
 * Naming of the test:
 * [*environment path*|*endpoint path*] *what it should do*
 *
 * The test resources are stored in test/resources.
 */
describe("send-200", () => {
  before(() => {
    fetchMock(
      (u) => u == "https://test.url/start",
      (m) => m == "GET",
    )
      .status(200, "Ok")
      .json({ test: "json" });
  });

  test
    .stdout()
    .command([
      "send",
      "test/resources/collections/url-start.json",
      "-v",
      "bearerToken: 3",
    ])
    .it(
      "[test-env|url-start] should log request and response by default",
      (ctx) => {
        const output = ctx.stdout.split("\n");

        expectNextLineToBe(output, "Request:");
        // Endpoint
        expectNextLineToBe(output, " GET https://test.url/start");
        // Headers
        expectNextLineToBe(output, "Authorization: Bearer 3");
        // new line
        expectNextLineToBe(output, "");
        // cool checkbox
        expectNextLineToBe(output, " ✓");
        // new line
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "Response:");
        expectNextLineToBe(output, "200 Ok");
        expectNextLineToBe(output, "content-type: application/json");
        expectNextLineToBe(output, "{");
        expectNextLineToBe(output, '    "test": "json"');
        expectNextLineToBe(output, "}");
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "");

        expect(output.length).to.eq(0);
      },
    );

  test
    .stdout()
    .command(["send", "test/resources/collections/url-start-header.json"])
    .it(
      "[test-env|url-start-header] should overwrite endpoint header with environment variable",
      (ctx) => {
        const output = ctx.stdout.split("\n");

        expectNextLineToBe(output, "Request:");
        // Endpoint
        expectNextLineToBe(output, " GET https://test.url/start");
        // Headers
        expectNextLineToBe(output, "Authorization: Basic LRClient");
        // new line
        expectNextLineToBe(output, "");
        // cool checkbox
        expectNextLineToBe(output, "Sending request... ✓");
        // new line
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "Response:");
        expectNextLineToBe(output, "200 Ok");
        expectNextLineToBe(output, "content-type: application/json");
        expectNextLineToBe(output, "{");
        expectNextLineToBe(output, '    "test": "json"');
        expectNextLineToBe(output, "}");
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "");

        expect(output.length).to.eq(0);
      },
    );

  test
    .stdout()
    .command([
      "send",
      "test/resources/collections/url-start-header.json",
      "-l",
      "endpoint",
      "-l",
      "env",
    ])
    .it(
      "[test-env|url-start-header] should log endpoint and env if configured",
      (ctx) => {
        const output = ctx.stdout.split("\n");

        expectNextLineToBe(
          output,
          "./test/resources/environments/test-env-1.json",
        );
        expectNextLineToBe(output, "Headers:");
        expectNextLineToBe(output, "Authorization: Bearer {{bearerToken}}");
        expectNextLineToBe(output, "Variables:");
        expectNextLineToBe(output, "baseUrl=https://test.url");
        expectNextLineToBe(output, "user=lmnch");
        expectNextLineToBe(output, "repository=LRClient");
        expectNextLineToBe(
          output,
          "requestUrl={{baseUrl}}/{{user}}/{{repository}}",
        );
        expectNextLineToBe(output, "");
        expectNextLineToBe(
          output,
          "test/resources/collections/url-start-header.json",
        );
        expectNextLineToBe(output, " GET {{baseUrl}}/start");
        expectNextLineToBe(output, "Authorization: Basic {{repository}}");
        expectNextLineToBe(output, "");
        // Always printed because not directly part of the logger
        expectNextLineToBe(output, "Sending request... ✓");
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "");

        expect(output.length).to.eq(0);
      },
    );
});

describe("send-403", () => {
  before(() => {
    fetchMock(
      (u) => u == "https://test.url/start",
      (m) => m == "GET",
    )
      .status(403, "Forbidden")
      .json({});
  });

  test
    .stdout()
    .command(["send", "test/resources/collections/url-start-header.json"])
    .it(
      "[test-env|url-start-header] should overwrite endpoint header with environment variable",
      (ctx) => {
        const output = ctx.stdout.split("\n");

        expectNextLineToBe(output, "Request:");
        // Endpoint
        expectNextLineToBe(output, " GET https://test.url/start");
        // Headers
        expectNextLineToBe(output, "Authorization: Basic LRClient");
        // new line
        expectNextLineToBe(output, "");
        // cool checkbox
        expectNextLineToBe(output, "Sending request... ✓");
        // new line
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "Response:");
        expectNextLineToBe(output, "403 Forbidden");
        expectNextLineToBe(output, "content-type: application/json");
        expectNextLineToBe(output, "{}");
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "");

        expect(output.length).to.eq(0);
      },
    );
});

describe("send-upload-post-200", () => {
  before(() => {
    fetchMock(
      (u) => u == "https://test.url/upload",
      (m) => m == "POST",
      undefined,
      (b) => JSON.parse(b).test.includes(42),
    )
      .status(200, "Ok")
      .json({ test: "json" });
  });

  test
    .stdout()
    .command([
      "send",
      "test/resources/collections/url-upload-post.json",
      "-v",
      "bearerToken: 123",
      "-v",
      "value3: 42",
    ])
    .it(
      "[test-env|url-upload-post|test-upload-payload] should upload a json payload with variable",
      (ctx) => {
        const output = ctx.stdout.split("\n");

        expectNextLineToBe(output, "Request:");
        // Endpoint
        expectNextLineToBe(output, "POST https://test.url/upload");
        // Headers
        expectNextLineToBe(output, "Authorization: Bearer 123");
        expectNextLineToBe(output, "Content-Type: application/json");
        // Body
        expectNextLineToBe(output, '{"test":[{"entry1":137},42,"42"]}');
        // new line
        expectNextLineToBe(output, "");
        // cool checkbox
        expectNextLineToBe(output, "Sending request... ✓");
        // new line
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "Response:");
        expectNextLineToBe(output, "200 Ok");
        expectNextLineToBe(output, "content-type: application/json");
        expectNextLineToBe(output, "{");
        expectNextLineToBe(output, '    "test": "json"');
        expectNextLineToBe(output, "}");
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "");

        expect(output.length).to.eq(0);
      },
    );

  // TODO: find a way to test this (probably improve command error handling)
  // test
  // .stdout()
  // .command(['send', 'test/resources/collections/url-upload-post.json', '-v', 'bearerToken: 123'])
  // .it('[test-env|url-upload-post|test-upload-payload] should fail if variable not set', ctx => {
  //   const {error} = ctx;
  //   expect(error.message).to.be.eq("Variable value3 not defined in scope!");
  // });
});

// test
// .nock('https://api.heroku.com', api => api
//   .get('/account')
//   // HTTP 401 means the user is not logged in with valid credentials
//   .reply(401)
// )
// .command(['auth:whoami'])
// // checks to ensure the command exits with status 100
// .exit(100)
// .it('exits with status 100 when not logged in')
