// Learn more https://docs.expo.io/guides/customizing-metro
const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const withStorybook = require('@storybook/react-native/metro/withStorybook');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// pnpm workspace: dependencies hoist to the repo root (see .npmrc,
// node-linker=hoisted), so Metro has to watch the whole workspace and resolve
// from both module trees. Hierarchical lookup is disabled so a stray
// node_modules further up the disk can never shadow a workspace package.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = withUniwindConfig(withStorybook(config), {
  // relative path to your global.css file (from previous step)
  cssEntryFile: './src/global.css',
  // (optional) path where we gonna auto-generate typings
  // defaults to project's root
  dtsFile: './src/uniwind-types.d.ts',
  extraThemes: ['light', 'dark'],
});
