import { glob } from 'glob';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {default as zeroEks} from '0x'
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const benchRoot = path.join(__dirname, '../benchmark/build/');
const sourceRoot = path.join(benchRoot, 'tests');

const outputPath = path.join(__dirname, '../benchmark/output')


if(!fs.existsSync(outputPath)){
  fs.mkdirSync(outputPath)
}


async function benchmark() {
const tests = await glob('**/*.js', {
  cwd: sourceRoot,
});

tests.forEach((test) => {

  const capture = async() => {
    
    const opts = {
      argv: [path.join(sourceRoot, test)],
      workingDir: __dirname,
      title: test,
      outputDir: `./output/${test}/`
    }
    try {
      const file = await zeroEks(opts)
      console.log(`flamegraph in ${file}`)
    } catch (err) {
      console.error(err)
    }
   }
   capture()
})

}
benchmark()



//Glob match all tests, throttle?
//sort the order so each run is consistent
//Import 0x - run each test in isolation.
//Remove bottom 


//Nested tokens
//reference-chains a > b > c > d > e
//reference-chains with eval math. b = a * a, c = b * b, d = c * c

//Interaction with figma DOM?!