import { loadEnvironment, LRCLogger } from "lrclient";
import BaseCommand from "../base-command";

export default class SetEnvironment extends BaseCommand {
  static description = "Updates the current working environment";

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
  ];

  static flags = {};

  static args = [
    {
      name: "environment",
      description: "Path to the environment json file",
      required: true,
    },
  ];

  async run(): Promise<void> {
    const { args, flags } = await this.parse(SetEnvironment);

    const logger = new LRCLogger(this.getLoggerConfig(flags));
    const configManager = this.getConfigManager(flags);

    const config = await configManager.loadConfig();
    config.selectedEnvironment = args.environment;
    await configManager.storeConfig(config);

    if (config.selectedEnvironment) {
      const env = await loadEnvironment(config.selectedEnvironment);
      logger.logEnvironment(config.selectedEnvironment, env);
    }

    this.log("Updated config ⚙️");
  }
}
