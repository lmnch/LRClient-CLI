import { loadPayload, LRCLogger, storePayload } from "lrclient";
import { launchEditor } from "../../external/launch-editor";
import BaseCommand from "../base-command";

export default class EditPayload extends BaseCommand {
  static description =
    "Updates the payload data of the passed payload definition";

  static examples = [
    `<%= config.bin %> <%= command.id %> payloads/example.json
*opens editor*
Type: application/json
{
    "test": 123
}
  `,
  ];

  static flags = {};
  static args = [
    {
      name: "payload",
      description: "Path to the payload definition json file",
      required: true,
    },
  ];

  static aliases = ["pe"];

  async run(): Promise<void> {
    const { args } = await this.parse(EditPayload);

    const payload = await loadPayload(args.payload);

    const edited: string = await launchEditor(await payload.getRawData(true));

    payload.setRawData(edited);
    await storePayload(args.payload, payload);

    LRCLogger.instance.logPayload(payload);
  }
}
