import { glob } from 'glob';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { default as zeroEks } from '0x'
import fs from 'fs-extra';
import { roundTo } from 'round-to';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const benchRoot = path.join(__dirname, '../benchmark/build/');
const sourceRoot = path.join(benchRoot, 'tests');

const outputPath = path.join(__dirname, '../benchmark/output');

//Ignores existing values and overwrites them
const UPDATE = process.argv.includes('--update');


// > 5% drop in performance is considered a potential regression
const SOFT_PERFORMANCE_LEEWAY = 5;
// > 15% drop in performance is considered an actual regression
const HARD_PERFORMANCE_LEEWAY = 15;
//Amount of times we run the baseline to get a more accurate result
const BASELINE_AMOUNT = 5;

async function setup() {
  const exists = await fs.exists(outputPath);
  if (!exists) {
    await fs.mkdir(outputPath)
  }
}



async function benchmark() {
  const tests = await glob('**/*.js', {
    cwd: sourceRoot,
    ignore: ['baseline.js']
  });

  if (tests.length === 0) {
    console.log('No tests found. Have you compiled the benchmark tests?');
    process.exit(1);
  }

  const baselines = new Array(BASELINE_AMOUNT).fill(0);

  const baseLineTests = await Promise.all(baselines.map(async () => {
    const baselineStart = performance.now();
    const val = await zeroEks({
      argv: [path.join(sourceRoot, './baseline.js')],
      workingDir: __dirname,
      title: 'Baseline',
      outputDir: `./output/baseline/`
    });
    return performance.now() - baselineStart
  }));

  //Note in the CI, the first tests seems to be way more expensive than the rest
  const baseline = baseLineTests.slice(1).reduce((acc, curr) => acc + curr, 0) / (baseLineTests.length - 1);

  console.log(`Baseline completed ${baseline}ms `);

  console.log(`Starting ${tests.length} tests`);
  const results = await Promise.all(tests.sort().map(async (test) => {

    const opts = {
      argv: [path.join(sourceRoot, test)],
      workingDir: __dirname,
      title: test,
      outputDir: `./output/${test}/`
    }
    try {
      const time = performance.now();
      const file = await zeroEks(opts);
      const rawDuration = performance.now() - time;
      const relativeToBaseLine = rawDuration / baseline;
      let delta = 0;

      const statsPath = path.join(__dirname, `./stats/${test}.json`);
      if (!UPDATE) {

        try {
          const existing = await fs.readJson(statsPath);
          if (existing) {
            delta = ((relativeToBaseLine - existing.duration) / existing.duration) * 100;
            if (delta > HARD_PERFORMANCE_LEEWAY) {
              console.error(`Regression detected for ${test} - ${delta}% increase in time`);
              return 'Fail';
            }
            if (delta > SOFT_PERFORMANCE_LEEWAY) {
              console.warn(`Potential regression detected for ${test} - ${delta}% increase in time`);
            }
          }
        }
        catch (err) {
          //Ignore
          console.log('No existing stats, cannot compare times');
        }
      }
      //Removes the file:// prefix from the path

      console.log(`Test ${test} - delta: ${roundTo(delta, 2)}% norm: ${roundTo(relativeToBaseLine, 2)} raw: ${roundTo(rawDuration, 2)}ms`);
      const cleanedPath = path.relative(__dirname, file.slice('file://'.length));

      const results = {
        rawDuration,
        duration: relativeToBaseLine,
        input: test,
        output: cleanedPath
      }

      if (UPDATE) {
        await fs.outputFile(statsPath, JSON.stringify(results));
      }
      return results;

    } catch (err) {
      console.error(err);
      return Promise.reject(err);
    }

  }));
  const failures = results.filter((r) => r === 'Fail');
  console.log('Tests completed');

  if (failures.length > 0) {
    console.error(`Tests failed: ${failures.length}`);
    process.exit(1);
  }
}

async function execute() {
  await setup();
  await benchmark();
}
execute();
//Glob match all tests, throttle?
//sort the order so each run is consistent
//Import 0x - run each test in isolation.
//Remove bottom 


//Nested tokens
//reference-chains a > b > c > d > e
//reference-chains with eval math. b = a * a, c = b * b, d = c * c

//Interaction with figma DOM?!