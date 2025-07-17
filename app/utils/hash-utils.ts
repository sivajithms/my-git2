import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import * as crypto from "crypto";
import { GIT_DIR } from "./constants";

export function generateHash(bufferVal: Buffer, type: string, write: boolean) {
  const header = `${type} ${bufferVal.length}\0`;
  const blobStore = Buffer.concat([Buffer.from(header), bufferVal]);
  const hash = crypto.createHash('sha1').update(blobStore).digest('hex');

  if (write === true) {
    const folder = hash.slice(0, 2);
    const file = hash.slice(2);

    const folderPath = path.join(process.cwd(), GIT_DIR, "objects", folder);
    const filePath = path.join(folderPath, file);

    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(filePath, zlib.deflateSync(blobStore));
  }
  return hash;
};
