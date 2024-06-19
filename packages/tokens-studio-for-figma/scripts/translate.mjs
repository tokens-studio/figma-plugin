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

  const targetLanguages = (await fs.readdir(langRoot)).filter((file) => file !== 'en')

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

        // Check if the value contains double braces with interpolation placeholders
        const hasInterpolation = /\{\{([^{}]+?)\}\}/.test(value);
        if (hasInterpolation) {
            // Extract the interpolation placeholders and preserve the braces
            const placeholders = value.match(/\{\{([^{}]+?)\}\}/g);

            // Replace the interpolation placeholders with a placeholder token
            const placeholderToken = '__PLACEHOLDER__';
            const replacedValue = value.replace(/\{\{([^{}]+?)\}\}/g, placeholderToken);

            // Translate the replaced value
            // @ts-ignore
            const translated = await translate(replacedValue, { from: 'en', to: lang });

            // Restore the interpolation placeholders using the placeholder token
            const translatedValue = placeholders.reduce((acc, placeholder) => {
              return acc.replace(placeholderToken, placeholder);
            }, translated);

            setProperty(newAcc, key, translatedValue);
        } else {

          try {  // @ts-ignore
            const translated = await translate(value, { from: 'en', to: lang });
            
            setProperty(newAcc, key, translated);
            
          } catch (err) {
            console.log(`Failed to translate ${key} in ${file} to ${lang}`);
          }
        }
        return newAcc
      }, initial);


      await fs.writeFile(path.join(langRoot, lang, file), `${JSON.stringify(completed, null, 2)}\n`);
    }));
  });

}

autoTranslate();
