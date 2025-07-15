import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import * as crypto from "crypto";


console.error("Logs from your program will appear here!");

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
  Init = "init",
  CatFile = "cat-file",
  HashObject = "hash-object",
  LsTree = "ls-tree",
}
switch (command) {
  case Commands.Init:
    createGitDirectory();
    break;
  case Commands.CatFile:
    readFileBlob();
    break;
  case Commands.HashObject:
    hashObject(args);
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

function createGitDirectory(): void {
  const gitDir = path.join(process.cwd(), "myGit");

  fs.mkdirSync(path.join(gitDir, "objects"), { recursive: true });
  fs.mkdirSync(path.join(gitDir, "refs"), { recursive: true });

  fs.writeFileSync(path.join(gitDir, "HEAD"), "ref: refs/heads/main\n");
  console.log("Initialized git directory");
}

function readFileBlob(): void {
  const hash = process.argv[4];
  const folder = hash.substring(0, 2);
  const file = hash.substring(2);

  const blobPath = path.join(process.cwd(), "myGit", "objects", folder, file);
  const compressed = fs.readFileSync(blobPath);
  const decompressed = zlib.unzipSync(compressed).toString();

  process.stdout.write(decompressed.substring(decompressed.indexOf("\x00") + 1));
}

function hashObject(args: string[]): void {
  const fileName = args.at(-1);
  if (!fileName) {
    console.error("No file provided");
    return;
  }

  const filePath = path.join(__dirname, fileName);
  const fileContent = fs.readFileSync(filePath);
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
