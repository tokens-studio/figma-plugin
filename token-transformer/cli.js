#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const getDirName = require('path').dirname;
const transformTokens = require('./dist/transform').tokenTransformer.default;
const path = require('path');

/**
 * Command line arguments
 */
const argv = yargs(hideBin(process.argv))
    .usage('token-transformer input output sets excludes')
    .example('token-transformer input.json output.json global,dark,components global')

    .command('$0 <input> [output] [sets] [excludes]', 'transforms given tokens', (_yargs) => {
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
            .option('expandShadow', {
                type: 'boolean',
                describe: 'Expands shadow in the output tokens',
                default: false,
            })
            .option('expandComposition', {
                type: 'boolean',
                describe: 'Expands composition in the output tokens',
                default: false,
            })
            .option('preserveRawValue', {
                type: 'boolean',
                describe: 'Preserve the raw, unprocessed value in the output tokens',
                default: false,
            })
            .option('throwErrorWhenNotResolved', {
                type: 'boolean',
                describe: 'Throw error when failed to resolve token',
                default: false,
            })
            .option('resolveReferences', {
                type: 'boolean | "math"',
                describe: 'Resolves references, removing any aliases or math expressions',
                default: true,
            })
            .option('theme', {
                type: 'boolean',
                describe: 'Use theme configuration ($themes) to determine sets, excludes and output name.',
                default: false,
            })
            .option('themeOutputPath', {
                type: 'string',
                describe: 'Specific path to write the output to, when using theme option',
            });
    })

    .help()
    .version()
    .parse();

/**
 * Utility functions
 */
const writeFile = (path, contents, cb) => {
    fs.mkdir(getDirName(path), { recursive: true }, (err) => {
        if (err) return cb(err);

        return fs.writeFile(path, contents, cb);
    });
};

const log = (message) => process.stdout.write(`[token-transformer] ${message}\n`);

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + '/' + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, '/', file));
        }
    });

    return arrayOfFiles.filter((file) => file.endsWith('.json') && !file.includes('$themes.json'));
};

const getTokens = async (input) => {
    if (input.endsWith('.json')) {
        const fileContent = fs.readFileSync(input, { encoding: 'utf8', flag: 'r' });
        return JSON.parse(fileContent);
    } else {
        const files = getAllFiles(input);
        var data = {};
        files.forEach((file) => {
            const content = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
            const parsed = JSON.parse(content);
            const key = file.replace(`${input}${path.sep}`, '').replace(path.sep, '/').replace('.json', '');
            data[key] = parsed;
        });

        return data;
    }
};

const transformTokensAndWriteFile = async (tokens, input, sets, excludes, options, output) => {
    log(`transforming tokens from input: ${input}`);
    log(`using sets: ${sets.length > 0 ? sets : '[]'}`);
    log(`using excludes: ${excludes.length > 0 ? excludes : '[]'}`);
    log(
        `using options: { expandTypography: ${options.expandTypography}, expandShadow: ${options.expandShadow}, expandComposition: ${options.expandComposition}, preserveRawValue: ${options.preserveRawValue}, resolveReferences: ${options.resolveReferences} }`
    );
    const transformed = transformTokens(tokens, sets, excludes, options);

    log(`writing tokens to output: ${output}`);
    writeFile(output, JSON.stringify(transformed, null, 2), () => {
        log('done transforming');
    });
};

const processThemesConfigTransformAndWrite = (themes, tokens, input, options) => {
    themes.forEach((theme) => {
        const themeSets = [];
        const themeExcludes = [];
        new Map(Object.entries(theme.selectedTokenSets)).forEach((value, key) => {
            value === 'enabled' && themeSets.push(key);
            value === 'disabled' && themeExcludes.push(key);
            value === 'source' && themeSets.push(key) && themeExcludes.push(key);
        });
        transformTokensAndWriteFile(
            tokens,
            input,
            themeSets,
            themeExcludes,
            options,
            options.themeOutputPath ? path.join(options.themeOutputPath, theme.name + '.json') : `${theme.name}.json`
        );
    });
};

/**
 * Transformation
 *
 * Reads the given input file, transforms all tokens and writes them to the output file
 */
const transform = async () => {
    const {
        input,
        output,
        sets: setsArg,
        excludes: excludesArg,
        expandTypography,
        expandShadow,
        expandComposition,
        preserveRawValue,
        throwErrorWhenNotResolved,
        resolveReferences: resolveReferencesArg,
        theme,
        themeOutputPath,
    } = argv;

    const sets = typeof setsArg === 'string' ? setsArg.split(',') : setsArg;
    const excludes = typeof excludesArg === 'string' ? excludesArg.split(',') : excludesArg;
    // yargs will convert a command option of type: 'boolean | "math"' to string type in all cases - convert back to primitive boolan if set to 'true'|'false':
    const resolveReferences = ['true', 'false'].includes(resolveReferencesArg)
        ? resolveReferencesArg === 'true'
        : resolveReferencesArg;

    const options = {
        expandTypography,
        expandShadow,
        expandComposition,
        preserveRawValue,
        throwErrorWhenNotResolved,
        resolveReferences,
        theme,
        themeOutputPath,
    };
    if (fs.existsSync(argv.input)) {
        const tokens = await getTokens(input);
        if (options.theme) {
            if (input.endsWith('.json')) {
                const themeConfig = JSON.parse(fs.readFileSync(input, { encoding: 'utf8', flag: 'r' }))['$themes'];
                processThemesConfigTransformAndWrite(themeConfig, tokens, input, options);
            } else {
                const themesPath = path.join(input, '$themes.json');
                if (fs.existsSync(themesPath)) {
                    const themeConfig = JSON.parse(fs.readFileSync(themesPath));
                    processThemesConfigTransformAndWrite(themeConfig, tokens, input, options);
                } else {
                    log(`ERROR: No themes.json file found at ${input}`);
                }
            }
        } else {
            transformTokensAndWriteFile(tokens, input, sets, excludes, options, output);
        }
    } else {
        log(`ERROR: Input not found at ${input}`);
    }
};

transform();
