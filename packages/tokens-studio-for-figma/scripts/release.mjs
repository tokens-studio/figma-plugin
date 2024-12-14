import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Octokit } from '@octokit/rest';
import * as url from 'url';

import { extractChangeset } from './parse-changeset.mjs';
import { publishChangeset } from './changeset.mjs';
import { getPluginVersion } from './prepare.mjs';
import { publishRelease } from './publish-release.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function readJSONFile(filePath) {
  const absoluteFilePath = path.resolve(filePath);
  const data = await readFile(absoluteFilePath, 'utf8');
  return JSON.parse(data);
}

async function main() {
  const packageJson = await readJSONFile(path.join(__dirname, '../package.json'));

  const currentPluginVersion = await getPluginVersion()
  if (Number(currentPluginVersion) >= packageJson.figma.version) {
    throw new Error('Current plugin version is larger than or equal to the Figma plugin version in package.json');
  }

  const changes = extractChangeset(packageJson.name, packageJson.version);

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });
  const owner = 'tokens-studio';
  const repo = 'figma-plugin';

  const release = await octokit.rest.repos.getReleaseByTag({
    owner,
    repo,
    tag: `${packageJson.name}@${packageJson.version}`,
  });

  await createZipBundle(true);

  await octokit.rest.repos.uploadReleaseAsset({
    owner,
    repo,
    release_id: release.data.id,
    data: await readFile(path.join(__dirname, '../dist/release.zip')),
    name: 'release.zip',
    upload_url: release.data.upload_url,
  });


  const featurebaseUrl = await publishChangeset(packageJson.version, packageJson.version, changes);

  console.log('Starting Figma publish');
  await publishRelease(featurebaseUrl);
}

main();
