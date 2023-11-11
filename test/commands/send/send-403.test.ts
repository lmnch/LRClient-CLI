import { expect, test } from "@oclif/test";
import { mock, clearMocks, FetchCallAssertions, Eq, ContainsAll, Contains } from './../../helpers/fetchmock';
import { expectNextLineToBe } from "../../helpers/expectNextLineToBe";

/**
 * Naming of the test:
 * [*environment path*|*endpoint path*] *what it should do*
 *
 * The test resources are stored in test/resources.
 */
describe("send-403", () => {
  beforeEach(()=>{
    // Prepare assertions
    const assertions = new FetchCallAssertions();
    assertions.resource = new Eq<RequestInfo|URL>(new URL("https://test.url/start"));
    assertions.method = new Eq("GET");
    assertions.headerParams = new Contains("Authorization", "Basic LRClient");

    const responseHeaders = new Headers();
    responseHeaders.append("content-type", "application/json")

    mock(assertions, new Response(JSON.stringify({}), {status: 403, statusText: "Forbidden", headers: responseHeaders }));
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
        expectNextLineToBe(output, "403 Forbidden");
        expectNextLineToBe(output, "content-type: application/json");
        expectNextLineToBe(output, "{}");
        expectNextLineToBe(output, "");
        expectNextLineToBe(output, "");

        expect(output.length).to.eq(0);
      },
    );

    afterEach(()=>{
      clearMocks();
    });
});


