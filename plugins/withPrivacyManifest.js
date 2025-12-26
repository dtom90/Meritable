const { withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo config plugin to automatically add PrivacyInfo.xcprivacy to the Xcode project
 */
const withPrivacyManifest = (config) => {
  return withXcodeProject(config, async (config) => {
    const xcodeProject = config.modResults;
    const projectPath = config.modRequest.projectName;
    const privacyManifestPath = path.join(projectPath, 'PrivacyInfo.xcprivacy');
    
    // Source file location (in assets/ directory, which won't be wiped)
    const projectRoot = config.modRequest.projectRoot;
    const sourcePath = path.join(projectRoot, 'assets', 'PrivacyInfo.xcprivacy');
    // Destination in the app bundle
    const destPath = path.join(config.modRequest.platformProjectRoot, privacyManifestPath);
    
    // Copy the privacy manifest from source to app bundle if it exists
    if (fs.existsSync(sourcePath)) {
      if (!fs.existsSync(path.dirname(destPath))) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
      }
      fs.copyFileSync(sourcePath, destPath);
      console.log('✓ Copied PrivacyInfo.xcprivacy to app bundle');
    } else {
      // Also check if it's already in the app bundle
      if (!fs.existsSync(destPath)) {
        console.warn('PrivacyInfo.xcprivacy not found, skipping...');
        return config;
      }
    }

    // Find the app group in Xcode project
    const appGroup = xcodeProject.findPBXGroupKey({ name: projectPath });
    
    if (!appGroup) {
      console.warn('Could not find app group in Xcode project');
      return config;
    }

    // Check if PrivacyInfo.xcprivacy is already in the project
    const existingFile = xcodeProject.hasFile(privacyManifestPath);
    if (existingFile) {
      console.log('✓ PrivacyInfo.xcprivacy already in Xcode project');
      return config;
    }

    // Add the file to the Xcode project using the same pattern as Info.plist
    const fileRef = xcodeProject.addPbxGroup([privacyManifestPath], appGroup, projectPath);
    
    // Also ensure it's added as a file reference
    const fileReference = xcodeProject.addFile(privacyManifestPath, appGroup, {
      lastKnownFileType: 'text.plist.xml',
      explicitFileType: 'text.plist.xml',
      name: 'PrivacyInfo.xcprivacy',
      path: privacyManifestPath,
      sourceTree: '"<group>"',
    });

    if (fileReference) {
      console.log('✓ Added PrivacyInfo.xcprivacy to Xcode project');
    } else {
      console.warn('⚠ Could not add PrivacyInfo.xcprivacy to Xcode project (file may still be included in bundle)');
    }
    
    return config;
  });
};

module.exports = withPrivacyManifest;
