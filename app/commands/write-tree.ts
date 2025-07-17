import { recursiveCreateTree } from '../utils/tree-utils';

export function handleWriteTreeCommand() {
  const basePath = process.cwd();
  const treeHash = recursiveCreateTree(basePath);
  process.stdout.write(treeHash);
}