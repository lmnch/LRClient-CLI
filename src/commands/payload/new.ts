import {CliUx, Flags} from '@oclif/core';
import * as cliSelect from 'cli-select-2';
import {
  Payload,
  LRCLogger,
  PayloadFile,
  PayloadJson,
  PayloadText,
  PayloadType,
  storePayload,
} from 'lrclient';
import {launchEditor} from '../../external/launch-editor';
import BaseCommand from '../base-command';

export default class NewPayload extends BaseCommand {
  static description = 'Creates a new payload configuration file';

  static examples = [
    `<%= config.bin %> <%= command.id %> payloads/example.json
Which type of payload should be created?
(x) application/json
( ) application/text
( ) application/octet-stream
( ) application/pdf
*opens editor*
Type: application/json
{
    "test": 123
}
  `,
  ];

  static args = [
    {
      name: 'payload',
      description: 'Path to the payload definition json file',
      required: true,
    },
  ];

  static aliases = ['pn'];

  static flags = {
    payloadType: Flags.string({
      char: 't',
      description: `Type of the payload (${Object.values(PayloadType).join(
        ', ',
      )}) `,
      required: false,
      multiple: false,
    }),
  };

  async run(): Promise<void> {
    const {args, flags} = await this.parse(NewPayload);

    let payloadType = flags.payloadType;

    if (!payloadType) {
      this.log('Payload Type:');
      payloadType = await (
        await cliSelect({values: Object.values(PayloadType)})
      ).value;
      this.log(payloadType);
    }

    const newPayload: Payload = await NewPayload.readPayload(payloadType);

    await storePayload(args.payload, newPayload);

    this.log();
    LRCLogger.instance.logPayload(newPayload);
  }

  static async readPayload(payloadType: string): Promise<Payload> {
    switch (payloadType) {
    case PayloadType.APPLICATION_JSON:
      return new PayloadJson(await launchEditor('', '.json'));
    case PayloadType.APPLICATION_TEXT:
      return new PayloadText(await launchEditor('', '.txt'));
    case PayloadType.APPLICATION_OCTET_STREAM:
    case PayloadType.APPLICATION_PDF:
      return new PayloadFile(await CliUx.ux.prompt('Path to file'));
    default:
      break;
    }

    throw new Error(`Could not read payload type ${payloadType}.`);
  }
}
