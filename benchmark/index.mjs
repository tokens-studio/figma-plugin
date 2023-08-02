import { glob } from 'glob';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { default as zeroEks } from '0x'
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const benchRoot = path.join(__dirname, '../benchmark/build/');
const sourceRoot = path.join(benchRoot, 'tests');

const outputPath = path.join(__dirname, '../benchmark/output')

// > 15% drop in performance is considered a regression
const PERFORMANCE_LEEWAY = 1.15;

async function setup() {
  const exists = await fs.exists(outputPath);
  if (!exists) {
    await fs.mkdir(outputPath)
  }
}



async function benchmark() {
  const tests = await glob('**/*.js', {
    cwd: sourceRoot,
  });

  await Promise.all(tests.sort().map(async (test) => {

    const capture = async () => {

      const opts = {
        argv: [path.join(sourceRoot, test)],
        workingDir: __dirname,
        title: test,
        outputDir: `./output/${test}/`
      }
      try {
        const time = performance.now();
        const file = await zeroEks(opts);
        const duration = performance.now() - time;
        console.log(`Test ${test} - completed`);
        const statsPath = path.join(__dirname, `./stats/${test}.json`);
        try {
          const existing = await fs.readJson(statsPath);
          if (existing) {
            if (existing.duration > (duration) * PERFORMANCE_LEEWAY) {
              console.log('Potential regression detected for ' + test + ' - ' + existing.duration + 'ms -> ' + duration + 'ms');
            }
          }
        }
        catch (err) {
          console.log(err)
          //Ignore
          console.log('No existing stats');
        }

        //Removes the file:// prefix from the path
        const cleanedPath =

        await fs.outputFile(statsPath, JSON.stringify({ duration, input: test, output : file  }));


      } catch (err) {
        console.error(err)
      }
    }
    capture()
  }));

}


async function execute() {
  await setup();
  await benchmark();
}
execute()
//Glob match all tests, throttle?
//sort the order so each run is consistent
//Import 0x - run each test in isolation.
//Remove bottom 


//Nested tokens
//reference-chains a > b > c > d > e
//reference-chains with eval math. b = a * a, c = b * b, d = c * c

//Interaction with figma DOM?!