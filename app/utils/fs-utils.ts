import * as fs from 'fs';
import * as path from 'path';
import { GIT_DIR } from './constants';

export function getGitObjectPath(hash: string): string {
  const folder = hash.slice(0, 2);
  const file = hash.slice(2);
  return path.join(process.cwd(), GIT_DIR, 'objects', folder, file);
}

export function ensureDirExists(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeObject(hash: string, data: Buffer): void {
  const folder = hash.slice(0, 2);
  const file = hash.slice(2);
  const dirPath = path.join(process.cwd(), GIT_DIR, 'objects', folder);
  const filePath = path.join(dirPath, file);

  ensureDirExists(dirPath);
  fs.writeFileSync(filePath, data);
}

export function readCompressedObject(hash: string): Buffer {
  const filePath = getGitObjectPath(hash);
  return fs.readFileSync(filePath);
}
