import { readFile, writeFile } from 'fs/promises';
import path from 'path';

import { extractChangeset } from "./parse-changeset.mjs";

// import * as fs from 'fs-extra';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __filename = url.fileURLToPath(import.meta.url);

async function readJSONFile(filePath) {
  const absoluteFilePath = path.resolve(filePath)
  const data = await readFile(absoluteFilePath, 'utf8');
  return JSON.parse(data);
}

async function main() {
  console.log('main()');
  const packageJson = await readJSONFile(path.join(__dirname, '../package.json'));

  const changes = extractChangeset(packageJson.name, packageJson.version);  

  console.log(`${changes}`);
}

main();
