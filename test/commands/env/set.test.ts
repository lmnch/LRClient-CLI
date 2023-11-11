import * as fs from 'node:fs';
import {expect, test} from '@oclif/test';

describe('env:set', () => {
  // Prepare test env filetemplate
  before(() => {
    if (!fs.existsSync('./tmp')) {
      fs.mkdirSync('./tmp');
    }

    fs.writeFileSync(
      './tmp/testenvironment.json',
      '{"headers":{"X-Test":"Header value"},"variables":{"var":"test"}}',
    );
    fs.writeFileSync(
      './tmp/testconfig.json',
      '{"selectedEnvironment":"./tmp/environment2.json"}',
    );
  });

  test
  .stdout()
  .command([
    'env:set',
    './tmp/testenvironment.json',
    '--config=./tmp/testconfig.json',
  ])
  .it('should overwrite existing config', ctx => {
    expect(ctx.stdout).to.eq('Updated config ⚙️\n');
    const config = fs.readFileSync('./tmp/testconfig.json').toString();
    expect(config).to.contain(
      '"selectedEnvironment":"./tmp/testenvironment.json"',
    );
  });

  test
  .stdout()
  .command([
    'env:set',
    './tmp/testenvironment.json',
    '--config=./tmp/testconfig-2.json',
  ])
  .it('should create new config', ctx => {
    expect(ctx.stdout).to.eq('Updated config ⚙️\n');
    const config = fs.readFileSync('./tmp/testconfig-2.json').toString();
    expect(config).to.contain(
      '"selectedEnvironment":"./tmp/testenvironment.json"',
    );
  });

  // cleanup
  after(() => {
    fs.rmSync('./tmp/testenvironment.json');
    fs.rmSync('./tmp/testconfig.json');
    fs.rmSync('./tmp/testconfig-2.json', {recursive: true});
  });
});
