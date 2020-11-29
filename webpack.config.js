const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: './scripts/main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'assets/**/*',
          context: 'src/',
        },
        {
          from: 'index.html',
          context: 'src/',
        },
      ],
    }),
  ],
};
