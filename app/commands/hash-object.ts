import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import * as crypto from "crypto";

export function hashObject(args: string[]): void {
  const fileName = args.at(-1);
  if (!fileName) {
    console.error("No file provided");
    return;
  }

  // const filePath = path.join(__dirname, fileName);
  // const fileContent = fs.readFileSync(filePath);
  const fileContent = fs.readFileSync(process.cwd() + '/' + fileName);

  const objectBuffer = Buffer.from(`blob ${fileContent.length}\x00${fileContent.toString()}`);
  const blobData = zlib.deflateSync(objectBuffer);
  const objectSha = crypto.createHash("sha1").update(objectBuffer).digest("hex");
  const objectFolder = objectSha.substring(0, 2);
  const objectFile = objectSha.substring(2);
  const objectDirPath = path.join(__dirname, "../myGit/objects", objectFolder);

  if (fs.existsSync(objectDirPath)) {
    fs.rmSync(objectDirPath, { recursive: true, force: true });
  }

  fs.mkdirSync(objectDirPath, { recursive: true });
  fs.writeFileSync(path.join(objectDirPath, objectFile), blobData);

  process.stdout.write(objectSha);
}