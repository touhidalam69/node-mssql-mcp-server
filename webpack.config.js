const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js', // Entry point for your application
  //entry: './src/app.js', // Entry point for your application

  target: 'node', // Target Node.js
  externals: [nodeExternals()], // Exclude Node.js modules (e.g., express, pg) from the bundle
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'sql_mcp.js', // Single bundled file
  },
  mode: 'production', // Optimize for production
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Optional: Transpile modern JavaScript
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};