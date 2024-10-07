import JSZip from 'jszip';
import { glob } from 'glob';
import path from 'path';
import { readFile, writeFile } from 'fs/promises';
// import * as fs from 'fs-extra';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __filename = url.fileURLToPath(import.meta.url);

async function readJSONFile(filePath) {
  const absoluteFilePath = path.resolve(filePath)

  const data = await readFile(absoluteFilePath, 'utf8');

  return JSON.parse(data);
}


async function bundle() {
  try {
    const zip = new JSZip();

    // fs.ensureDirSync('dist');
    // const files = await glob(['packages/tokens-studio-for-figma/dist/*.js', 'packages/tokens-studio-for-figma/dist/*.html'], { nodir: true });

    // await Promise.all(files.map(async (file) => {
    //   await zip.file(file, fs.readFileSync(file, 'utf8'));
    // }));

    const packageJson = await readJSONFile('package.json');
    const manifest = await readJSONFile('manifest.json');

    //   console.log({ manifest })
    const main = await readFile(path.resolve(manifest.main), 'utf8');
    const ui = await readFile(path.resolve(manifest.ui), 'utf8');

    await zip.file(manifest.main, main);
    await zip.file(manifest.ui, ui);
    await zip.file('manifest.json', JSON.stringify({ ...manifest, name: `Tokens Studio for Figma: Beta - ${packageJson.version}` }));
    await zip.file('package.json', JSON.stringify(packageJson));

    // console.log(main, ui);
    // await zip.file('packages/tokens-studio-for-figma/manifest.json', fs.readFileSync('packages/tokens-studio-for-figma/manifest.json', 'utf8'));
    // await zip.file('packages/tokens-studio-for-figma/package.json', fs.readFileSync('packages/tokens-studio-for-figma/package.json', 'utf8'));

    const file = await zip.generateAsync({ type: 'nodebuffer' });
    await writeFile('dist/bundle.zip', file);
  } catch(err) {
    console.log(err)
  }
}

bundle();
