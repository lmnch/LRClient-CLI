import { expect, test } from "@oclif/test";
import { mock, clearMocks, FetchCallAssertions, Eq, ContainsAll, Contains } from './../../helpers/fetchmock';
import { expectNextLineToBe } from "../../helpers/expectNextLineToBe";

/**
 * Naming of the test:
 * [*environment path*|*endpoint path*] *what it should do*
 *
 * The test resources are stored in test/resources.
 */
describe("send-200-var-replacement", () => {
  beforeEach(()=>{
    // Prepare assertions
    const assertions = new FetchCallAssertions();
    assertions.resource = new Eq<RequestInfo|URL>(new URL("https://test.url/start"));
    assertions.method = new Eq("GET");
    assertions.headerParams = new Contains("Authorization", "Bearer 3");

    const responseHeaders = new Headers();
    responseHeaders.append("content-type", "application/json")

    mock(assertions, new Response(JSON.stringify({test:"json"}), {status: 200, statusText: "Ok", headers: responseHeaders }));
  })

  test
    .stdout()
    .command([
      "send",
      "--config=./test/resources/test.config",
      "test/resources/collections/url-start.json",
      "-v",
      "bearerToken=3",
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
        // sending output
        expectNextLineToBe(output, "Sending request...");
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

});

describe("send-200-env-var", ()=>{
  beforeEach(()=>{
    // Prepare assertions
    const assertions = new FetchCallAssertions();
    assertions.resource = new Eq<RequestInfo|URL>(new URL("https://test.url/start"));
    assertions.method = new Eq("GET");
    assertions.headerParams = new ContainsAll({"Authorization": "Basic LRClient"});

    const responseHeaders = new Headers();
    responseHeaders.append("content-type", "application/json")

    mock(assertions, new Response(JSON.stringify({test:"json"}), {status: 200, statusText: "Ok", headers: responseHeaders }));
  });

  test
    .stdout()
    .command([
      "send",
      "--config=./test/resources/test.config",
      "test/resources/collections/url-start-header.json"
    ])
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
        expectNextLineToBe(output, "Sending request...");
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
      "--config=./test/resources/test.config",
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
        expectNextLineToBe(output, "Sending request...");
        expectNextLineToBe(output, "Sending request... ✓");
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "");

        expect(output.length).to.eq(0);
      },
    );

    afterEach(()=>{
      clearMocks();
    });
});

