#!/usr/bin/env node

const fs = require("fs")
const transformTokens = require("./dist/transform").default

function transform() {
    const [input, output, ...sets] = process.argv.slice(2);

    const tokens = fs.readFileSync(input, {encoding: 'utf8', flag: 'r'});
    const parsed = JSON.parse(tokens);
    const transformed = transformTokens(parsed, sets);
    fs.writeFileSync(output, JSON.stringify(transformed, null, 2));
    process.stdout.write(`Transformed tokens from ${input} to ${output}, using sets ${sets.join(', ')}`);
}

transform()