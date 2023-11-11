import { expect, test } from "@oclif/test";
import {
  mock,
  clearMocks,
  FetchCallAssertions,
  Eq,
  ContainsAll,
  Any,
} from "./../../helpers/fetchmock";
import { expectNextLineToBe } from "../../helpers/expect-next-line-to-be";

/**
 * Naming of the test:
 * [*environment path*|*endpoint path*] *what it should do*
 *
 * The test resources are stored in test/resources.
 */
describe("send-upload-post-200", () => {
  beforeEach(() => {
    // Prepare assertions
    const assertions = new FetchCallAssertions();
    assertions.resource = new Eq<RequestInfo | URL | string>(
      "https://test.url/upload",
    );
    assertions.method = new Eq("POST");
    assertions.headerParams = new ContainsAll({ Authorization: "Bearer 123" });
    assertions.payloadParams = {
      matches: (payload: any): boolean => {
        const obj = JSON.parse(payload);
        const test: any[] = obj.test;

        return test[0].entry1 === 137 && test[1] === 42 && test[2] === "42";
      },
    };
    assertions.payloadParams = new Any();

    const responseHeaders = new Headers();
    responseHeaders.append("content-type", "application/json");

    mock(
      assertions,
      new Response(JSON.stringify({ test: "json" }), {
        status: 200,
        statusText: "Ok",
        headers: responseHeaders,
      }),
    );
  });

  test
    .stdout()
    .command([
      "send",
      "test/resources/collections/url-upload-post.json",
      "--config=./test/resources/test.config",
      "-v",
      "bearerToken=123",
      "-v",
      "value3=42",
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

  // TODO: find a way to test this (probably improve command error handling)
  // test
  // .stdout()
  // .command(['send', 'test/resources/collections/url-upload-post.json', '-v', 'bearerToken: 123'])
  // .it('[test-env|url-upload-post|test-upload-payload] should fail if variable not set', ctx => {
  //   const {error} = ctx;
  //   expect(error.message).to.be.eq("Variable value3 not defined in scope!");
  // });

  afterEach(() => {
    clearMocks();
  });
});
