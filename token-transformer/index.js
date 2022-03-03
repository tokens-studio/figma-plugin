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
                default: [],
            })
            .positional('excludes', {
                description: 'Sets that should not be part of the export (e.g. a global color scale)',
                type: 'string',
                default: [],
            })
            .option('expandTypography', {
                type: 'boolean',
                describe: 'Expands typography in the output tokens',
                default: false,
            })
            .option('preserveRawValue', {
                type: 'boolean',
                describe: 'Preserve the raw, unprocessed value in the output tokens',
                default: false
            });
    })

    .help()
    .version()
    .parse();

/**
 * Utility functions
 */
const writeFile = (path, contents, cb) => {
    fs.mkdir(getDirName(path), {recursive: true}, (err) => {
        if (err) return cb(err);

        return fs.writeFile(path, contents, cb);
    });
};

const log = (message) => process.stdout.write(`[token-transformer] ${message}\n`);

/**
 * Transformation
 *
 * Reads the given input file, transforms all tokens and writes them to the output file
 */
const transform = () => {
    const {input, output, sets, excludes, expandTypography, preserveRawValue} = argv;

    if (fs.existsSync(argv.input)) {
        const tokens = fs.readFileSync(input, {encoding: 'utf8', flag: 'r'});
        const parsed = JSON.parse(tokens);
        const options = {
            expandTypography,
            preserveRawValue
        };

        log(`transforming tokens from input: ${input}`);
        log(`using sets: ${sets.length > 0 ? sets : '[]'}`);
        log(`using excludes: ${excludes.length > 0 ? excludes : '[]'}`);
        log(`using options: { expandTypography: ${expandTypography}, preserveRawValue: ${preserveRawValue} }`);

        const transformed = transformTokens(parsed, sets, excludes, options);

        log(`writing tokens to output: ${output}`);

        writeFile(output, JSON.stringify(transformed, null, 2), () => {
            log('done transforming');
        });
    } else {
        log(`ERROR: Input not found at ${input}`);
    }
};

transform();
