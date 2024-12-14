import JSZip from 'jszip';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function readJSONFile(filePath) {
  const absoluteFilePath = path.join(__dirname, filePath);
  const data = await readFile(absoluteFilePath, 'utf8');
  return JSON.parse(data);
}

async function createZipBundle(isRelease) {
  const zip = new JSZip();

  const packageJson = await readJSONFile('../package.json');
  const manifest = await readJSONFile('../manifest.json');

  const main = await readFile(path.join(__dirname, '..', manifest.main), 'utf8');
  const ui = await readFile(path.join(__dirname, '..', manifest.ui), 'utf8');

  await zip.file(manifest.main, main);
  await zip.file(manifest.ui, ui);
  await zip.file(
    'manifest.json',
    JSON.stringify({
      ...manifest,
      name: isRelease ? 'Tokens Studio for Figma' : `Tokens Studio for Figma: Beta - ${packageJson.version}`,
    }),
  );
  await zip.file('package.json', JSON.stringify(packageJson));

  const file = await zip.generateAsync({ type: 'nodebuffer' });
  return await writeFile(isRelease ? 'dist/release.zip' : 'dist/bundle.zip', file);
}

async function bundle() {
  try {
    await createZipBundle();
    await createZipBundle(true);
  } catch (err) {
    console.log(err);
  }
}

bundle();
