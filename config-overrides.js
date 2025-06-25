const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  // Handle entry array or string
  if (config.entry) {
    // If entry is a string, convert to array
    if (typeof config.entry === 'string') {
      config.entry = [config.entry];
    }
    
    // Add process polyfill to the beginning
    if (Array.isArray(config.entry)) {
      config.entry.unshift(require.resolve('process/browser'));
    } else if (typeof config.entry === 'object') {
      // For webpack 5, entry might be an object
      Object.keys(config.entry).forEach(entryPoint => {
        const entry = config.entry[entryPoint];
        if (Array.isArray(entry)) {
          entry.unshift(require.resolve('process/browser'));
        } else if (typeof entry === 'string') {
          config.entry[entryPoint] = [require.resolve('process/browser'), entry];
        }
      });
    }
  }

  // Add fallbacks for node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util/"),
    "url": require.resolve("url/"),
    "crypto": require.resolve("crypto-browserify"),
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "assert": require.resolve("assert/"),
    "process": require.resolve("process/browser"),
    "buffer": require.resolve("buffer/"),
    "fs": false,
    "path": false,
    "os": false,
    "zlib": false,
  };

  // Remove all existing DefinePlugin instances
  config.plugins = config.plugins.filter(plugin => {
    return !(plugin.constructor && plugin.constructor.name === 'DefinePlugin');
  });

  // Create a single environment object with all variables
  const envKeys = Object.keys(process.env).reduce((prev, next) => {
    prev[next] = JSON.stringify(process.env[next]);
    return prev;
  }, {});

  // Add buffer and process plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Add a single DefinePlugin with all environment variables
    new webpack.DefinePlugin({
      'process.env': envKeys,
    })
  ];

  // Support for mjs files (used by some dependencies)
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false
    }
  });

  return config;
}; 