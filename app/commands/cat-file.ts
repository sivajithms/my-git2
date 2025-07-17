import * as zlib from 'zlib';
import * as fs from "fs";
import { GIT_DIR } from '../utils/constants';
import * as path from 'path';

export function readFileBlob(args: string[]): void {
  const hash = args[2];
  const folder = hash.substring(0, 2);
  const file = hash.substring(2);

  const blobPath = path.join(process.cwd(), GIT_DIR, "objects", folder, file);
  const compressed = fs.readFileSync(blobPath);
  const decompressed = zlib.unzipSync(compressed).toString();

  process.stdout.write(decompressed.substring(decompressed.indexOf("\x00") + 1));
};
