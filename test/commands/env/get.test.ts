import * as fs from "fs";
import { expect, test } from "@oclif/test";

describe("env:get", () => {
  // Prepare test env filetemplate
  before(() => {
    if (!fs.existsSync("./tmp")) {
      fs.mkdirSync("./tmp");
    }
    fs.writeFileSync(
      "./tmp/testenvironment.json",
      '{"headers":{"X-Test":"Header value"},"variables":{"var":"test"}}',
    );
    fs.writeFileSync(
      "./tmp/testconfig-with-environment.json",
      '{"selectedEnvironment":"./tmp/testenvironment.json"}',
    );
    fs.writeFileSync(
      "./tmp/testconfig-without-environment.json",
      '{}',
    );
  });

  test
    .stdout()
    .command(["env:get", "--config=./tmp/testconfig-with-environment.json"])
    .it("should print the env's headers and variables", (ctx) => {
      expect(ctx.stdout).to.contain("Headers:");
      expect(ctx.stdout).to.contain("X-Test: Header value");
      expect(ctx.stdout).to.contain("Variables:");
      expect(ctx.stdout).to.contain("var=test");
    });

  test
    .stdout()
    .command(["env:get", "--config=./tmp/testconfig-without-environment.json"])
    .it("should display not selected message", (ctx) => {
      expect(ctx.stdout).to.eq("No environment selected!\n");
    });

  // cleanup
  after(() => {
    fs.rmSync("./tmp/testenvironment.json");
    fs.rmSync("./tmp/testconfig-with-environment.json");
    fs.rmSync("./tmp/testconfig-without-environment.json");
  });
});
