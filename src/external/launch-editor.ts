import * as fs from "node:fs/promises";
import { sep } from "node:path";
import * as childProcess from "node:child_process";

const editor: string | undefined = process.env.EDITOR;

export class NoEditorSetError extends Error {
  constructor() {
    super(
      "No editor was set! Please configure an editor with $EDITOR variable.",
    );
  }
}

export async function launchEditor(
  data: string,
  extension = "",
): Promise<string> {
  if (!editor) {
    throw new NoEditorSetError();
  }

  return new Promise((res: (arg0: string) => void, rej) => {
    const filename = ".tmp" + extension;
    fs.writeFile(filename, data).then((_) => {
      editFile(filename)
        .then((_) => {
          fs.readFile(filename).then((edited: Buffer) => {
            fs.rm(filename);
            res(edited.toString());
          });
        })
        .catch((error) => rej(error));
    });
  });
}

export async function editFile(filePath: string): Promise<void> {
  const pathParts = filePath.split(sep);

  if (pathParts.length > 1) {
    // Try to create missing directories
    await fs.mkdir(pathParts.slice(0, -1).join(sep), {
      recursive: true,
    });
  }

  if (!editor) {
    throw new NoEditorSetError();
  }

  const child = childProcess.spawn(editor, [filePath], {
    stdio: "inherit",
  });
  child.on("exit", (e: Error, _: any) => {
    if (e) {
      throw e;
    }
  });
}
