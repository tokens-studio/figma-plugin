import * as fs from 'fs/promises';
import { glob } from 'glob';
import * as path from 'path';
import {
  getProperty, deepKeys, hasProperty, setProperty,
} from 'dot-prop';
import translate from 'translate';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const langRoot = path.join(__dirname, '../src/i18n/lang');
const sourceRoot = path.join(langRoot, 'en');


async function autoTranslate() {

  const sourceOfTruth = await glob('**/*.json', {
    cwd: sourceRoot,
  });

  const targetLanguages = (await fs.readdir(langRoot)).filter((file) => file !== 'en');

  console.log('Found source of truth files: ', sourceOfTruth);
  console.log(`Found ${targetLanguages.length} target languages `);

  sourceOfTruth.map(async (file) => {
    // Load the file contents

    const source = await fs.readFile(path.join(sourceRoot, file), 'utf8');
    const sourceObj = JSON.parse(source);

    // This flattens the potentially nested object into a single level
    const keys = deepKeys(sourceObj);

    // Attempt to translate target languages
    await Promise.all(targetLanguages.map(async (lang) => {
      let existing = {};
      try {
        const existingFile = await fs.readFile(path.join(langRoot, lang, file), 'utf8');
        existing = JSON.parse(existingFile);
      } catch (err) {
        // Assume it doesn't exist
        existing = {};
      }

      const initial = Promise.resolve(existing);

      const completed = await keys.reduce(async (acc, key) => {

        const newAcc = await acc;

        if (hasProperty(newAcc, key)) {
          // Already translated
          return newAcc;
        }

        const value = getProperty(sourceObj, key);

        // @ts-ignore
        const translated = await translate(value, { from: 'en', to: lang });
        setProperty(newAcc, key, translated);
        return newAcc
      }, initial);


      await fs.writeFile(path.join(langRoot, lang, file), JSON.stringify(completed, null, 4));
    }));
  });

}

autoTranslate();
