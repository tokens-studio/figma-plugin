import fs from 'fs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


// Function to parse the markdown file and extract the version changes for the package
function extractChanges(markdown, packageName, version) {
  const packageRegex = new RegExp(`# ${packageName}`, 'i');
  const versionRegex = new RegExp(`## ${version}`, 'i');

  // Split the markdown into sections based on headings
  const sections = markdown.split('\n# ');

  // Find the section related to the specific package
  const packageSection = sections.find(section => packageRegex.test(`# ${section}`));
  if (!packageSection) {
    console.log(`Package ${packageName} not found in the markdown.`);
    return [];
  }

  // Find the subsection related to the specific version
  const versionSection = packageSection.split('\n## ').find(section => versionRegex.test(`## ${section}`));
  if (!versionSection) {
    console.log(`Version ${version} not found for package ${packageName}.`);
    return [];
  }

  // Find the "Patch Changes" heading and extract the following list of changes
  const patchChanges = versionSection.split('\n### Patch Changes\n')[1];

  // Return the list of changes or an empty list if no changes found
  return patchChanges ? patchChanges.trim().split('\n') : [];
}

// Usage example:

// Read the markdown file
const markdownFilePath = '../CHANGELOG.md'; // Path to the markdown file
const markdown = fs.readFileSync(path.join(__dirname, markdownFilePath), 'utf-8');

// Define the package name and version you want to extract

export function extractChangeset(packageName = '@elemental-figma/json-to-figma', version) {
  const changes = extractChanges(markdown, packageName, version);

  return changes;
}
