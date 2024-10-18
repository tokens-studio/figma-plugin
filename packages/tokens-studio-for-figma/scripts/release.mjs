import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Octokit } from '@octokit/rest';

import { extractChangeset } from './parse-changeset.mjs';

// import * as fs from 'fs-extra';
import * as url from 'url';
import { publishChangeset } from './changeset.mjs';
import { prepare } from './prepare.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function readJSONFile(filePath) {
  const absoluteFilePath = path.resolve(filePath);
  const data = await readFile(absoluteFilePath, 'utf8');
  return JSON.parse(data);
}

async function main() {
  const packageJson = await readJSONFile(path.join(__dirname, '../package.json'));

  const changes = extractChangeset(packageJson.name, packageJson.version);

  console.log(`${changes.join('\n')}`);

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    // baseUrl: this.baseUrl || undefined,
  });

  const release = await octokit.rest.repos.getReleaseByTag({
    owner: 'tokens-studio',
    repo: 'figma-plugin',
    tag: `v${packageJson.version}`,
  });

  const releaseZip = await fs.readFileSync(path.join(__dirname, '../dist/release.zip'));

  const uploadReleaseAssetRes = await octokit.rest.repos.uploadReleaseAsset({
    owner,
    repo,
    url: release.data.upload_url,
    release_id: release.data.id,
    data: releaseZip,
    headers: {
      'content-type': contentType,
      'content-length': fs.statSync(asset).size,
    },
    name: 'release.zip',
  });

  console.log(uploadReleaseAssetRes);

  // await prepare();

  // await publishChangeset(packageJson.version, packageJson.version, changes);
}

main();
