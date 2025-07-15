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
  Write = "write-tree",
}
switch (command) {
  case Commands.Init:
    createGitDirectory();
    break;
  case Commands.CatFile:
    readFileBlob(args);
    break;
  case Commands.HashObject:
    hashObject(args);
    break;
  case Commands.LsTree:
    handleTreeInspectCommand(args);
    break;
  case Commands.Write:
    handleWriteTreeCommand()
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

function readFileBlob(args: string[]): void {
  const hash = args[2];
  const folder = hash.substring(0, 2);
  const file = hash.substring(2);

  const blobPath = path.join(process.cwd(), "myGit", "objects", folder, file);
  const compressed = fs.readFileSync(blobPath);
  const decompressed = zlib.unzipSync(compressed).toString();

  process.stdout.write(decompressed.substring(decompressed.indexOf("\x00") + 1));
};

function generateHash(bufferVal: Buffer, type: string, write: boolean) {
  const header = `${type} ${bufferVal.length}\0`;
  const blobStore = Buffer.concat([Buffer.from(header), bufferVal]);
  const hash = crypto.createHash('sha1').update(blobStore).digest('hex');

  if (write === true) {
    const folder = hash.slice(0, 2);
    const file = hash.slice(2);

    const folderPath = path.join(process.cwd(), "myGit", "objects", folder);
    const filePath = path.join(folderPath, file);

    fs.mkdirSync(folderPath, { recursive: true });
    fs.writeFileSync(filePath, zlib.deflateSync(blobStore));
  }
  return hash;
};

function hashObject(args: string[]): void {
  const fileName = args.at(-1);
  if (!fileName) {
    console.error("No file provided");
    return;
  }

  // const filePath = path.join(__dirname, fileName);
  // const fileContent = fs.readFileSync(filePath);
  const fileContent = fs.readFileSync(process.cwd() + '/'+ fileName);

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

function handleTreeInspectCommand(args: string[]): void {
  const flag = args[1];
  const commitSHA = args[2];

  if (!commitSHA) {
    throw new Error("Commit SHA is missing. Usage: ls-tree <commitSHA>");
  }
  const folder = commitSHA.slice(0, 2);
  const file = commitSHA.slice(2);
  const folderPath = path.join(process.cwd(), "myGit", "objects", folder);
  const filePath = path.join(folderPath, file);

  if (!fs.existsSync(folderPath)) throw new Error(`Not a valid object name ${folderPath}`);
  if (!fs.existsSync(filePath)) throw new Error(`Not a valid object name ${filePath}`);

  const fileContents = fs.readFileSync(filePath);
  // console.log(fileContents);

  const decompressed = zlib.inflateSync(fileContents);
  const output = decompressed.toString("utf8");

  const nullByteIdx = output.indexOf("\0");
  if (nullByteIdx === -1) throw new Error("Incorrect tree format");
  const content = output.slice(nullByteIdx + 1);

  let result = "";
  let cursor = 0;

  while (cursor < content.length) {
    const spaceIndex = content.indexOf(" ", cursor);
    if (spaceIndex === -1) break;

    const nullIndex = content.indexOf("\0", spaceIndex);
    if (nullIndex === -1) break;

    const fileName = content.slice(spaceIndex + 1, nullIndex);
    result += fileName + "\n";

    cursor = nullIndex + 21;
  }

  process.stdout.write(result)
}


function recursiveCreateTree(dir: string): string {
  let treeBuffer = Buffer.alloc(0);
  let entriesArr = [];
  let fileEntries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of fileEntries) {
    if (entry.name === "myGit") continue;

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

function handleWriteTreeCommand() {
  const basePath = process.cwd();  
  const treeHash = recursiveCreateTree(basePath);
  process.stdout.write(treeHash);
}