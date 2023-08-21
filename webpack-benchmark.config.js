const path = require('path');
const fs = require('fs');

module.exports = (env, argv) => ({
  mode: 'development',
  devtool: 'source-map',
  entry: () => {
    const entryPoints = {};
    const testsPath = path.resolve(__dirname, 'benchmark/tests');
    const files = fs.readdirSync(testsPath);

    files.forEach((file) => {
      const fileName = file.replace('.ts', '');
      entryPoints[fileName] = path.resolve(testsPath, file);
    });
    return entryPoints;
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'benchmark/build/tests'), // Compile into a folder called "build"
    clean: true
  },

  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'swc-loader',
          },
        ],
        exclude: /node_modules/,
      },
      // Fixing colorjs imports, see https://github.com/tokens-studio/figma-plugin/pull/1498#issuecomment-1372082627
      {
        test: /\.c?js$/,
        use: [
          {
            loader: 'swc-loader',
          },
        ],
        exclude: /node_modules\/(?!(colorjs.io)\/)/,
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
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
});
