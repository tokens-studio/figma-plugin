#!/usr/bin/env node

const fs = require('fs');
const getDirName = require('path').dirname;
const transformTokens = require('./dist/transform').default;

function writeFile(path, contents, cb) {
    fs.mkdir(getDirName(path), {recursive: true}, function (err) {
        if (err) return cb(err);

        fs.writeFile(path, contents, cb);
    });
}

function transform() {
    const [input, output, rawSets, rawExcludes] = process.argv.slice(2);
    const sets = rawSets.split(',')
    const excludes = rawExcludes.split(',')
    if (!input) {
        process.stdout.write(`ERROR: Specify an input first (e.g. tokens.json)`);

        return;
    }

    if (!output) {
        process.stdout.write(`ERROR: Specify an output first (e.g. transformed.json)`);

        return;
    }

    if (fs.existsSync(input)) {
        const tokens = fs.readFileSync(input, {encoding: 'utf8', flag: 'r'});
        const parsed = JSON.parse(tokens);
        const transformed = transformTokens(parsed, sets, excludes);
        writeFile(output, JSON.stringify(transformed, null, 2), () => {
            process.stdout.write(`Transformed tokens from ${input} to ${output}, using sets ${sets.join(', ')}, excluding ${excludes.join(', ')}`);
        });
    } else {
        process.stdout.write(`ERROR: Input not found at ${input}`);
    }
}

transform();
