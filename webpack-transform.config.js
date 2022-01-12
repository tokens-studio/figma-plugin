const path = require('path');

module.exports = (env, argv) => ({
    mode: argv.mode === 'production' ? 'production' : 'development',

    entry: {
        transform: './src/utils/transform.ts', // The entry point for your plugin code
    },

    module: {
        rules: [
            // Converts TypeScript code to JavaScript
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },

    // Webpack tries these extensions for you if you omit the extension like "import './file'"
    resolve: {
        alias: {
            Types: path.resolve(__dirname, 'types'),
            '@types': path.resolve(__dirname, 'types'),
            '@': path.resolve(__dirname, 'src'),
        },
        fallback: {
            assert: require.resolve('assert'),
            fs: false,
            path: require.resolve('path-browserify'),
        },
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'token-transformer/dist'), // Compile into a folder called "dist"
        library: 'tokenTransformer',
        libraryTarget: 'commonjs2',
    },
});
