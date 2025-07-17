import * as fs from 'fs';
import * as path from 'path';
import { GIT_DIR } from '../utils/constants';

export function createGitDirectory(): void {
  const gitDir = path.join(process.cwd(), GIT_DIR);

  fs.mkdirSync(path.join(gitDir, "objects"), { recursive: true });
  fs.mkdirSync(path.join(gitDir, "refs"), { recursive: true });

  fs.writeFileSync(path.join(gitDir, "HEAD"), "ref: refs/heads/main\n");
  console.log("Initialized git directory");
}