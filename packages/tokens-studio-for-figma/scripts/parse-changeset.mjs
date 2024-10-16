import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

function extractChanges(markdown, packageName, version) {
  const packageRegex = new RegExp(`# ${packageName}`, 'i');
  const versionRegex = new RegExp(`## ${version}`, 'i');

  const sections = markdown.split('\n# ');

  const packageSection = sections.find((section) => packageRegex.test(`# ${section}`));
  if (!packageSection) {
    console.log(`Package ${packageName} not found in the markdown.`);
    return [];
  }

  const versionSection = packageSection.split('\n## ').find((section) => versionRegex.test(`## ${section}`));
  if (!versionSection) {
    console.log(`Version ${version} not found for package ${packageName}.`);
    return [];
  }

  const patchChanges = versionSection.split('\n### Patch Changes\n')[1];

  return patchChanges ? patchChanges.trim().split('\n') : [];
}

const markdownFilePath = '../CHANGELOG.md'; // Path to the markdown file
const markdown = fs.readFileSync(path.join(__dirname, markdownFilePath), 'utf-8');

export function extractChangeset(packageName = '@elemental-figma/json-to-figma', version) {
  const changes = extractChanges(markdown, packageName, version);

  return changes;
}
