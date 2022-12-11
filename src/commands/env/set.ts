import * as fs from 'fs';
import { Command } from '@oclif/core'
import { ConfigManager, loadEnvironment, LRCLogger } from 'lrclient';


export default class SetEnvironment extends Command {
  static description = 'Updates the current working environment'

  static examples = [
    `<%= config.bin %> <%= command.id %> ./env/test.json
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
Updated config ⚙️
`,
  ]

  static flags = {}

  static args = [{ name: "environment", description: "Path to the environment json file", required: true }]

  static logger = new LRCLogger();
  static configManager = new ConfigManager();

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SetEnvironment);

    // console.debug("Loading config...")
    const config = await SetEnvironment.configManager.loadConfig();
    // console.debug("Loaded config.")
    config.selectedEnvironment = args.environment;
    // console.debug("Storing config...")
    await SetEnvironment.configManager.storeConfig(config);

    if (config.selectedEnvironment) {
      const env = await loadEnvironment(config.selectedEnvironment);
      SetEnvironment.logger.logEnvironment(config.selectedEnvironment, env)
    }
    

    this.log("Updated config ⚙️");
  }

}
