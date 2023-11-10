import * as fs from 'fs';
import { Command } from '@oclif/core';
import { ConfigManager, loadEnvironment, LRCLogger, LRCLoggerConfig } from 'lrclient';
import BaseCommand from '../BaseCommand';

export default class GetEnvironment extends BaseCommand {
  static description = 'Returns the currently selected environment.'

  static examples = [
    `<%= config.bin %> <%= command.id %>
./env/test.json
Headers:
Authorization: Bearer {{bearerToken}}
User-Agent: Mozilla Firefox
Variables:
bearerToken=...
baseUrl=http://www.github.com
user=lmnch
repository=LRClient
requestUrl={{baseUrl}}/{{user}}/{{repository}}
`,
  ]

  static flags = {}

  static args = []

  static logger = new LRCLogger(new LRCLoggerConfig({logEnvironments: true}));
  static configManager = new ConfigManager();

  async run(): Promise<void> {
    const { flags } = await this.parse(GetEnvironment);
    // console.debug("Loading config...")
    const config= await this.getConfigManager(flags).loadConfig();
    // console.debug("Loaded config.")
    if (config.selectedEnvironment) {
      const env = await loadEnvironment(config.selectedEnvironment);
      GetEnvironment.logger.logEnvironment(config.selectedEnvironment, env)
    }else{
      this.log(`No environment selected!`);
    }

  }

}
