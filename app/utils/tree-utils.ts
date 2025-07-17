import * as fs from 'fs';
import * as path from 'path';
import { GIT_DIR } from './constants';
import { generateHash } from './hash-utils';

export function recursiveCreateTree(dir: string): string {
  let treeBuffer = Buffer.alloc(0);
  let entriesArr = [];
  let fileEntries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of fileEntries) {
    if (entry.name === GIT_DIR) continue;

    let mode: string;
    let hash: string;

    const pathName = path.join(dir, entry.name);

    if (entry.isFile()) {
      mode = "100644";
      const fileContent = fs.readFileSync(pathName);
      hash = generateHash(fileContent, "blob", true);

    }
    else {
      mode = "40000";
      hash = recursiveCreateTree(pathName);
    }

    entriesArr.push({
      mode: mode,
      hash: hash,
      name: entry.name
    })

  }

  entriesArr.sort((a, b) => a.name.localeCompare(b.name));


  for (const entry of entriesArr) {
    const entryHash = Buffer.concat([Buffer.from(`${entry.mode} ${entry.name}\0`),
    Buffer.from(entry.hash, 'hex')
    ])
    treeBuffer = Buffer.concat([treeBuffer, entryHash]);
  }
  return generateHash(treeBuffer, "tree", true);
}
