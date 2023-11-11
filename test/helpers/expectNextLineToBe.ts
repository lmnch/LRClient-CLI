import { expect } from "@oclif/test";

export function expectNextLineToBe (outputLines: string[], expected: string) {
  expect(outputLines.length).to.be.gte(1);
  if (expected !== undefined) {
    const output = outputLines[0];
    expect(output).to.be.eq(expected);
  }
  outputLines.shift();
};


