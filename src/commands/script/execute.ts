import { Command } from "@oclif/core";
import * as vm from "node:vm";
import * as fs from "fs/promises";
import BaseCommand from "../BaseCommand";
import { LRClient, LRCLoggerConfig } from "lrclient";

export default class Execute extends BaseCommand {
    static description = `Executes a ECMA script by providing LRClient as "lrc" variable in the context of an async method (=> "await" can be used).`
        + ` Additionally "log" can be used to log stuff like "console.log" (but this one is not working).`;

    static examples = [`<%= config.bin %> <%= command.id %> ./scripts/testscript.js
    `];

    static aliases = ["se"]

    static args = [
        { name: 'script', description: "Path to script that should be executed", required: true }
    ]

    async run(): Promise<void> {
        const { args, flags } = await this.parse(Execute);

        // Dependeincies
        const client = new LRClient(this.getLoggerConfig(flags));

        await client.init();

        const script = (await fs.readFile(args.script)).toString();
        // Wrap inside of method to support await keyword
        const code = `const sleep = async (millis) => new Promise((res,rej)=>{setTimeout(res,millis)});
        const executionLrcMethod = async (lrc, log) => { ${script} };\nexecutionLrcMethod(lrc, log);`;
        const context = { lrc: client, log: (...args: any[]) => { this.log(...args); }, setTimeout: setTimeout };
        vm.createContext(context);
        vm.runInContext(code, context);

    }

    _getDefaultLogging(): LRCLoggerConfig {
        // In a script: Log nothing by default
        return new LRCLoggerConfig({
            logEnvironments: false,
            logEndpoint: false, logEndpointPayload: false,
            logResponse: false, logRequestBody: false,
            logRequest: true, logResponseBody: false
        });
    }
}
