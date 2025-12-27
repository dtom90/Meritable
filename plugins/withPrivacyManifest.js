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
    
    // Ensure projectPath is defined
    if (!projectPath) {
      console.warn('Project name not found, skipping PrivacyInfo.xcprivacy addition');
      return config;
    }
    
    // Use forward slashes for Xcode project paths (platform-independent)
    const privacyManifestPath = `${projectPath}/PrivacyInfo.xcprivacy`;
    
    // Source file location (in assets/ directory, which won't be wiped)
    const projectRoot = config.modRequest.projectRoot;
    const sourcePath = path.join(projectRoot, 'assets', 'PrivacyInfo.xcprivacy');
    // Destination in the app bundle (use proper path joining for file system)
    const destPath = path.join(config.modRequest.platformProjectRoot, projectPath, 'PrivacyInfo.xcprivacy');
    // Also copy to ios/PrivacyInfo.xcprivacy in case Xcode expects it there
    const iosRootPath = path.join(config.modRequest.platformProjectRoot, 'PrivacyInfo.xcprivacy');
    
    // Copy the privacy manifest from source to app bundle if it exists
    if (fs.existsSync(sourcePath)) {
      // Copy to the app bundle directory (ios/Meritable/PrivacyInfo.xcprivacy)
      if (!fs.existsSync(path.dirname(destPath))) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
      }
      fs.copyFileSync(sourcePath, destPath);
      console.log('✓ Copied PrivacyInfo.xcprivacy to app bundle');
      
      // Also copy to ios/PrivacyInfo.xcprivacy if Xcode build phase expects it there
      if (!fs.existsSync(path.dirname(iosRootPath))) {
        fs.mkdirSync(path.dirname(iosRootPath), { recursive: true });
      }
      fs.copyFileSync(sourcePath, iosRootPath);
      console.log('✓ Copied PrivacyInfo.xcprivacy to ios root');
    } else {
      // Also check if it's already in the app bundle
      if (!fs.existsSync(destPath) && !fs.existsSync(iosRootPath)) {
        console.warn('PrivacyInfo.xcprivacy not found, skipping...');
        return config;
      }
    }

    // Check if PrivacyInfo.xcprivacy is already in the project
    const existingFile = xcodeProject.hasFile(privacyManifestPath);
    if (existingFile) {
      console.log('✓ PrivacyInfo.xcprivacy already in Xcode project');
      return config;
    }

    // Find the app group in Xcode project
    const appGroupKey = xcodeProject.findPBXGroupKey({ name: projectPath });
    
    if (!appGroupKey) {
      console.warn('Could not find app group in Xcode project');
      return config;
    }

    // Add the file to the Xcode project
    // Use filename as first param, full path in options
    try {
      const fileName = 'PrivacyInfo.xcprivacy';
      
      // Ensure privacyManifestPath is a valid string
      if (!privacyManifestPath || typeof privacyManifestPath !== 'string') {
        throw new Error(`Invalid privacy manifest path: ${privacyManifestPath}`);
      }
      
      const fileReference = xcodeProject.addFile(fileName, appGroupKey, {
        lastKnownFileType: 'text.plist.xml',
        path: privacyManifestPath,
        sourceTree: '"<group>"',
      });

      if (fileReference) {
        // Add the file to the "Copy Bundle Resources" build phase
        xcodeProject.addToPbxResourcesBuildPhase(fileReference);
        console.log('✓ Added PrivacyInfo.xcprivacy to Xcode project and build phase');
      } else {
        console.warn('⚠ Could not add PrivacyInfo.xcprivacy to Xcode project (file may still be included in bundle)');
      }
    } catch (error) {
      console.warn(`⚠ Error adding PrivacyInfo.xcprivacy to Xcode project: ${error.message}`);
      // Continue anyway - the file is copied to the bundle, which is the most important part
    }
    
    return config;
  });
};

module.exports = withPrivacyManifest;
