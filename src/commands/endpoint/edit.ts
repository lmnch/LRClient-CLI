

import { Command } from '@oclif/core';
import { loadEndpoint, LRCLogger, LRCLoggerConfig } from 'lrclient';
import { editFile } from '../../external/LaunchEditor';


export default class EditEndpoint extends Command {
    static description = 'Updates the endpoint configuration file in the editor set in $EDITOR variable.';

    static examples = [
        `<%= config.bin %> <%= command.id %> endpoints/example.json
endpoints/test.json
* Editor opens *
 PUT {{url}}/api
{
    "billo": "test"
}
  `,
    ]

    static flags = {}
    static args = [{ name: "endpoint", description: "Path to the endpoint definition json file", required: true }]
    static aliases = ["ee"]

    async run(): Promise<void> {
        const { args, flags } = await this.parse(EditEndpoint);

        await editFile(args.endpoint);

        const endpoint = await loadEndpoint(args.endpoint);

        new LRCLogger(new LRCLoggerConfig({ logEndpoint: true, logEndpointPayload: true })).logEndpoint(args.endpoint, endpoint);
    }

}
