import {expect} from '@oclif/test';

export function skipLineIfEq(outputLines: string[], expected: string): void {
  expect(outputLines.length).to.be.gte(1);
  if (expected !== undefined) {
    const output = outputLines[0];
    expect(output).to.be.eq(expected);
  }

  if (outputLines.length > 0 && outputLines[0] === expected) {
    outputLines.shift();
  }
}

export function expectNextLineToBe(
  outputLines: string[],
  expected: string,
): void {
  expect(outputLines.length).to.be.gte(1);
  if (expected !== undefined) {
    const output = outputLines[0];
    expect(output).to.be.eq(expected);
  }

  outputLines.shift();
}

export function expectNextLineToStartWith(
  outputLines: string[],
  expected: string,
): void {
  expect(outputLines.length).to.be.gte(1);
  if (expected !== undefined) {
    const output = outputLines[0];
    expect(output)
    .to.be.a('string')
    .and.satisfy((s: string) => s.startsWith(expected));
  }

  outputLines.shift();
}
