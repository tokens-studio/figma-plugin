module.exports = {
    presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
    plugins: ['@babel/proposal-class-properties', '@babel/proposal-object-rest-spread'],
    env: {
        test: {
            presets: [
                [
                    '@babel/preset-env',
                    {
                        modules: 'commonjs',
                    },
                ],
            ],
        },
    },
};
