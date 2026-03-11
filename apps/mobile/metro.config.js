const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = {
  watchFolders: [monorepoRoot],
  maxWorkers: 1,
  resolver: {
    nodeModulesPaths: [
      path.resolve(monorepoRoot, 'node_modules'),
      path.resolve(projectRoot, 'node_modules'),
    ],
  },
  server: {
    port: 8081,
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
