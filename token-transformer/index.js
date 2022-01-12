#!/usr/bin/env node

const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const fs = require('fs');
const getDirName = require('path').dirname;
const transformTokens = require('./dist/transform').default;

/**
 * Command line arguments
 */
const argv = yargs(hideBin(process.argv))
    .usage('token-transformer input output sets excludes')
    .example('token-transformer input.json output.json global,dark,components global')

    .command('$0 <input> <output> [sets] [excludes]', 'transforms given tokens', (_yargs) => {
        _yargs
            .positional('input', {
                description: 'Input file containing the tokens',
                type: 'string',
                array: true,
                demandOption: 'ERROR: Specify an input first (e.g. tokens.json)',
            })
            .positional('output', {
                description: 'Output file to write the transformed tokens to',
                type: 'string',
                array: true,
                demandOption: 'ERROR: Specify an output first (e.g. transformed.json)',
            })
            .positional('sets', {
                description: 'Sets to be used, comma separated',
                type: 'string',
            })
            .positional('excludes', {
                description: 'Sets that should not be part of the export (e.g. a global color scale)',
                type: 'string',
            })
            .option('expandTypography', {
                type: 'boolean',
                describe: 'Expands typography in the output tokens',
                default: false,
            });
    })

    .help()
    .version()
    .parse();

function writeFile(path, contents, cb) {
    fs.mkdir(getDirName(path), {recursive: true}, function (err) {
        if (err) return cb(err);

        fs.writeFile(path, contents, cb);
    });
}

function transform() {
    const {input, output, sets, excludes, expandTypography} = argv;

    if (fs.existsSync(argv.input)) {
        const tokens = fs.readFileSync(input, {encoding: 'utf8', flag: 'r'});
        const parsed = JSON.parse(tokens);
        const options = {
            expandTypography,
        };
        const transformed = transformTokens(parsed, sets, excludes, options);

        writeFile(output, JSON.stringify(transformed, null, 2), () => {
            process.stdout.write(
                `Transformed tokens from ${input} to ${output}, using sets ${sets.join(', ')}${
                    excludes.length > 0 ? `excluding ${excludes.join(', ')}` : ''
                }`
            );
        });
    } else {
        process.stdout.write(`ERROR: Input not found at ${input}`);
    }
}

transform();
