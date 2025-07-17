import { readFileBlob } from './commands/cat-file';
import { commitTree } from './commands/commit-tree';
import { hashObject } from './commands/hash-object';
import { createGitDirectory } from './commands/init';
import { handleTreeInspectCommand } from './commands/ls-tree';
import { handleWriteTreeCommand } from './commands/write-tree';
import { Commands } from './utils/constants';

console.error("Logs from your program will appear here!");

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case Commands.Init:
    createGitDirectory();
    break;

  case Commands.CatFile:
    if (args[1] === '-p' && args[2]) {
      readFileBlob(args);
    } else {
      console.error("Usage: cat-file -p <hash>");
    }
    break;

  case Commands.HashObject:
    if (args[1] === '-w' && args[2]) {
      hashObject(args);
    } else {
      console.error("Usage: hash-object -w <filename>");
    }
    break;

  case Commands.LsTree:
    if (args[1]) {
      handleTreeInspectCommand(args);
    } else {
      console.error("Usage: ls-tree <tree-sha>");
    }
    break;

  case Commands.Write:
    handleWriteTreeCommand();
    break;

  case Commands.CommitTree:
    const treeSha = args[1];
    const messageIndex = args.indexOf('-m');
    const message = messageIndex !== -1 ? args[messageIndex + 1] : '';

    if (treeSha && message) {
      commitTree(args);
    } else {
      console.error("Usage: commit-tree <tree-sha> -m \"message\"");
    }
    break;

  default:
    console.error(`Unknown command: ${command}`);
    process.exit(1);
}
