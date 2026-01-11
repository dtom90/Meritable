#!/usr/bin/env node

/* eslint-disable no-console, no-undef */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version argument from command line, default to 'patch'
const versionArg = process.argv[2] || 'patch';

// Validate version argument
const validArgs = ['patch', 'minor', 'major'];
const isValidSemver = /^\d+\.\d+\.\d+$/.test(versionArg);

if (!validArgs.includes(versionArg) && !isValidSemver) {
  console.error(`Invalid version argument: ${versionArg}`);
  console.error('Usage: node bump-version.js [patch|minor|major|1.2.3]');
  process.exit(1);
}

try {
  // Run npm version command (updates package.json and package-lock.json)
  // Use --no-git-tag-version to prevent git commit/tag creation
  execSync(`npm version ${versionArg} --no-git-tag-version`, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '..')
  });

  // Read the new version from package.json
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const newVersion = packageJson.version;

  // Update app.json
  const appJsonPath = path.resolve(__dirname, '..', 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  appJson.expo.version = newVersion;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

  console.log(`\n✓ Version bumped to ${newVersion}`);
  console.log(`  - package.json: ${newVersion}`);
  console.log(`  - package-lock.json: ${newVersion}`);
  console.log(`  - app.json: ${newVersion}`);
} catch (error) {
  console.error('Error bumping version:', error.message);
  process.exit(1);
}
