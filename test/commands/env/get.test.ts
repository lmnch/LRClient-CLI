  import * as fs from 'fs';
import {expect, test} from '@oclif/test'
import {Environment, Variable, VariableManager} from 'lrclient'

describe('env:get', () => {
  // Prepare test env filetemplate
  before(()=>{
  if(!fs.existsSync("./tmp")){
    fs.mkdirSync("./tmp");
  }
  fs.writeFileSync("./tmp/testenvironment.json", "{\"headers\":{\"X-Test\":\"Header value\"},\"variables\":{\"var\":\"test\"}}")
  fs.writeFileSync("./tmp/testconfig.json", "{\"selectedEnvironment\":\"./tmp/testenvironment.json\"}")
  })
  test
    .stdout()
    .command(['env:get', '--config=./tmp/testconfig.json'])
    .it('should print the currently selected environment', (ctx)=>{
      expect(ctx.stdout).to.contain("X-Test: Header value")
      expect(ctx.stdout).to.contain("var=test")
    });
  // cleanup
  after(()=>{
    fs.rmSync("./tmp/testenvironment.json");
    fs.rmSync("./tmp/testconfig.json");
  });
})
