import {Command, Flags} from '@oclif/core';
import {ConfigManager, LRCConstants, LRCLoggerConfig} from 'lrclient';

const configFile =
  process.env[LRCConstants.ENV_LRC_CONFIG_FILE] ||
  LRCConstants.DEFAULT_CONFIG_FILE;

export enum LoggedFields {
  env = 'env',
  endpoint = 'endpoint',
  endpointPayload = 'endpoint_payload',
  req = 'req',
  reqBody = 'req_body',
  resp = 'resp',
  respBody = 'resp_body',
}

export default abstract class BaseCommand extends Command {
  static globalFlags = {
    loggedFields: Flags.enum<LoggedFields>({
      summary: 'Specify level for logging.',
      options: Object.values(LoggedFields),
      helpGroup: 'GLOBAL',
      multiple: true,
      aliases: ['l'],
    }),
    config: Flags.string({
      summary:
        "Path to the lrc config file. Can be also set via LRC_CONFIG_FILE env const and is per default './.config'",
      helpGroup: 'GLOBAL',
      multiple: false,
    }),
  };

  /**
   * ORs a logger config based on the passed field with the default logger config of the command.
   * This can be used to enable additional logs.
   *
   * @param flags the flag object from the command invocation
   * @returns resulting logger config
   */
  getLoggerConfig(flags: any): LRCLoggerConfig {
    const fields = flags.loggedFields;
    if (!fields || fields.length === 0) {
      return this._getDefaultLogging();
    }

    return new LRCLoggerConfig({
      logEndpoint: fields.includes(LoggedFields.endpoint),
      logEndpointPayload: fields.includes(LoggedFields.endpointPayload),
      logEnvironments: fields.includes(LoggedFields.env),
      logResponse: fields.includes(LoggedFields.resp),
      logRequestBody: fields.includes(LoggedFields.reqBody),
      logRequest: fields.includes(LoggedFields.req),
      logResponseBody: fields.includes(LoggedFields.respBody),
    });
  }

  _getDefaultLogging(): LRCLoggerConfig {
    return new LRCLoggerConfig({});
  }

  /**
   * Returns the config manager based on
   * <ol>
   *  <li>command parameter --config</li>
   *  <li>environment const LRC_CONFIG_FILE</li>
   *  <li>Default value './.config'</li>
   * </ol>
   *
   * @param flags that were passed to the command
   * @returns lrc config manager
   */
  getConfigManager(flags: any): ConfigManager {
    const config = flags.config;
    if (!config) {
      return this._getDefaultConfigManager();
    }

    return new ConfigManager(config);
  }

  /**
   * Returns the config manager based on the environmentVariable @{link src/LRCConstants.ts#ENV_LRC_CONFIG_FILE}.
   * Or if not set, based on the default value @{link src/LRCConstants.ts#DEFAULT_CONFIG_FILE}.
   *
   * @returns config manager based on environment variable
   */
  _getDefaultConfigManager(): ConfigManager {
    return new ConfigManager(configFile);
  }
}
