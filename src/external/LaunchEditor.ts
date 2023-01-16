
import * as fs from 'fs/promises';
import { ChildProcess } from 'child_process';
import { fileURLToPath } from 'url';
import { sep } from 'path';
const child_process = require('child_process');


var editor = process.env.EDITOR;

export class NoEditorSetError extends Error {

    constructor() {
        super("No editor was set! Please configure an editor with $EDITOR variable.");
    }
}

export async function launchEditor(data: string, extension: string = ""): Promise<string> {
    if (!editor) {
        throw new NoEditorSetError();
    }
    return new Promise((res: (arg0: string) => void, rej) => {
        const filename = ".tmp"+ extension;
        fs.writeFile(filename, data).then(_ => {
            editFile(filename).then(_ => {
                fs.readFile(filename).then((edited: Buffer) => {
                    fs.rm(filename);
                    res(edited.toString());
                });
            }).catch(e => rej(e));
        });
    })
}

export async function editFile(filePath: string): Promise<void> {
    return new Promise(async (res: () => void, rej) => {
        const pathParts = filePath.split(sep);

        if (pathParts.length > 1) {
            // Try to create missing directories
            await fs.mkdir(pathParts.slice(0, pathParts.length - 1).join(sep), { recursive: true });
        }

        const child = child_process.spawn(editor, [filePath], {
            stdio: 'inherit'
        });
        child.on('exit', (e: Error, code: any) => {
            if (e) {
                rej(e);
            }
            res();
        });
    })
}
