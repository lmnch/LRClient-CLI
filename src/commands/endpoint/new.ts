import { CliUx, Command, Flags } from "@oclif/core";
import cliSelect = require("cli-select-2");
import {
  Endpoint,
  HttpMethod,
  loadPayload,
  LRCLogger,
  LRCLoggerConfig,
  storeEndpoint,
} from "lrclient";
import Variable from "lrclient/dist/variables/Variable";
import VariableManager from "lrclient/dist/variables/VariableManager";
import NewPayload from "../payload/new";

export default class NewEndpoint extends Command {
  static description = "Creates a new endpoint definition file.";

  static examples = [
    `<%= config.bin %> <%= command.id %> endpoints/example.json
URL: {{baseUrl}}/test
HTTP Method:
POST
Create new payload (y/n): n

endpoints/example.json
POST {{baseUrl}}/test

  `,
    `<%= config.bin %> <%= command.id %> endpoints/example.json
URL: {{baseUrl}}/api/test
HTTP Method:
PUT
Create new payload (y/n): y

Payload Path: payloads/data/test.json
Payload Type:
application/json

Type:  application/json
{
    "billo": "moin"
}
endpoints/example.json
 PUT {{baseUrl}}/api/test

  `,
  ];

  static args = [
    {
      name: "endpoint",
      description: "Path to the endpoint definition json file",
      required: true,
    },
  ];
  static aliases = ["en"];
  static flags = {
    url: Flags.string({
      char: "u",
      description: "URL of the endpoint (Could contain variables).",
      required: false,
      multiple: false,
    }),
    method: Flags.string({
      char: "m",
      description: `HTTP method for the request (${Object.values(
        HttpMethod,
      ).join(", ")}).`,
      required: false,
      multiple: false,
    }),
    headers: Flags.string({
      char: "h",
      description: "Headers that should be used when calling the endpoint.",
      required: false,
      multiple: true,
    }),
    localVariable: Flags.string({
      char: "v",
      description: "Variables for the endpoint.",
      required: false,
      multiple: true,
    }),
    payload: Flags.string({
      char: "p",
      description: `Path to payload for the endpoint.`,
      required: false,
      multiple: false,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(NewEndpoint);

    const path = args.endpoint;

    let url = flags.url;
    if (!url) {
      url = await CliUx.ux.prompt("URL");
    }

    let method = flags.type;
    if (!method) {
      this.log("HTTP Method:");
      method = await (
        await cliSelect({ values: Object.values(HttpMethod) })
      ).value;
      this.log(method);
    }

    let passedHeaders = flags.headers;
    const headers: { [key: string]: Variable } = {};
    if (passedHeaders) {
      (<Array<String>>passedHeaders).forEach((v) => {
        const [key, value] = v.split(": ");
        headers[key] = new Variable(`HEADER_${key}`, value);
      });
    }

    let passedVariables = flags.localVariable;
    const variables: { [key: string]: string } = {};
    if (passedVariables) {
      (<Array<String>>passedVariables).forEach((v) => {
        const [key, value] = v.split(": ");
        variables[key] = value;
      });
    }

    let payloadPath = flags.payload;
    if (!payloadPath) {
      const shouldCreatePayload = await CliUx.ux.confirm(
        "Create new payload (y/n)",
      );
      this.log();
      if (shouldCreatePayload) {
        payloadPath = await CliUx.ux.prompt("Payload Path");
      }
    }

    if (payloadPath) {
      await NewPayload.run([payloadPath]);
    }

    const endpoint = new Endpoint(
      new Variable("url", url),
      method,
      headers,
      new VariableManager(variables),
      payloadPath ? await loadPayload(payloadPath) : undefined,
    );
    await storeEndpoint(path, endpoint);

    await new LRCLogger(new LRCLoggerConfig({ logEndpoint: true })).logEndpoint(
      path,
      endpoint,
    );
  }
}
