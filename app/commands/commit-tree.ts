import * as crypto from 'crypto';
import * as zlib from 'zlib';
import * as fs from 'fs';
import * as path from 'path';
import { GIT_DIR } from '../utils/constants';

export function commitTree(args: string[]) {
  let parentSha: string | undefined;
  let message: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-p') parentSha = args[i + 1];
    if (args[i] === '-m') message = args[i + 1];
  }
  const lines = [`tree ${args[1]}`]
  if (parentSha) lines.push(`parent ${parentSha}`);
  const sign = getSignature()
  lines.push(`author ${sign}`, `committer ${sign}`, ``, message ?? '', ``);
  const content = Buffer.from(lines.join(`\n`), `utf8`)
  const header = Buffer.from(`commit ${content.length}\0`, `utf8`)
  const commit = Buffer.concat([header, content])

  const commitId = crypto.createHash('sha1').update(commit).digest('hex');
  const dir = commitId.slice(0, 2);
  const file = commitId.slice(2);
  const commitPath = `${GIT_DIR}/objects/${dir}/${file}`

  if (!fs.existsSync(commitPath)) {
    fs.mkdirSync(path.dirname(commitPath), { recursive: true });
    const compressed = zlib.deflateSync(commit);
    fs.writeFileSync(commitPath, compressed);
  }
  console.log(commitId)
}

function getSignature(): string {
  const name = process.env.GIT_AUTHOR_NAME || 'Example Author';
  const email = process.env.GIT_AUTHOR_EMAIL || 'author@example.com';
  // Hardcoded Unix timestamp (e.g., June 1, 2024, 12:00:00 UTC)
  const time = 1717233600;
  const offset = '-0400';
  return `${name} <${email}> ${time} ${offset}`;
}