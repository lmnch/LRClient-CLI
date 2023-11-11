import { CliUx, Flags } from "@oclif/core";
import { LRClient, LRCListener, LRCRequest, LRCResponse } from "lrclient";
import BaseCommand from "../base-command";

export default class Send extends BaseCommand implements LRCListener {
  static description = "Performs a REST call to a endpoint";

  static examples = [
    `$ <%= config.bin %> <%= command.id %> endpoints/examplerequest.json --localVariable "user: lukas"
Requesting...
POST http://www.google.com/lukas/LRClient
Authorization: Bearer ...
User-Agent: Mozilla Firefox

Response:
404 Not Found
content-length: 1575
content-type: text/html; charset=UTF-8
date: Sat, 19 Nov 2022 09:33:10 GMT
referrer-policy: no-referrer
<!DOCTYPE html>
<html lang=en>
    ...
`,
    `$ <%= config.bin %> <%= command.id %> endpoints/examplerequest.json
Requesting...
POST http://www.google.com/lmnch/LRClient
Authorization: Bearer ...
User-Agent: Mozilla Firefox

Response:
404 Not Found
content-length: 1575
content-type: text/html; charset=UTF-8
date: Sat, 19 Nov 2022 09:31:37 GMT
referrer-policy: no-referrer
<!DOCTYPE html>
<html lang=en>
...
`,
  ];

  static flags = {
    localVariable: Flags.string({
      char: "v",
      description:
        "Local variables to overwrite endpoint or environment variables",
      required: false,
      multiple: true,
    }),
    payload: Flags.string({
      char: "p",
      description: "Path to the payload which should be used for the request",
      required: false,
      multiple: false,
    }),
  };

  static args = [
    {
      name: "requestPath",
      description:
        "Path to the endpoint defintion json file that should be called",
      required: true,
    },
  ];

  onRequestSent(_: LRCRequest): void {
    CliUx.ux.action.start("Sending request", "", { stdout: true });
  }

  onResponseReceived(_: LRCResponse): void {
    CliUx.ux.action.stop("\u2713");
    this.log();
  }

  async run(): Promise<void> {
    const parsed = await this.parse(Send);
    const flags = parsed.flags;
    const args = parsed.args;

    const client = new LRClient(
      this.getLoggerConfig(flags),
      this.getConfigManager(flags),
    );
    await client.init({ listeners: [this] });

    const localDefinition: { [key: string]: string } = {};
    const { localVariable, payload } = flags;
    if (localVariable) {
      for (const v of <Array<string>>localVariable) {
        const [key, ...rest] = v.split("=");
        const value = rest.join("=");
        localDefinition[key] = value;
      }
    }

    await client.send(args.requestPath, localDefinition, payload);
  }
}
