// Polyfill for Array.prototype.toReversed() for Node.js < 20
if (!Array.prototype.toReversed) {
  Object.defineProperty(Array.prototype, 'toReversed', {
    value: function() {
      return [...this].reverse();
    },
    writable: true,
    enumerable: false,
    configurable: true
  });
}

const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');
 
const config = getDefaultConfig(__dirname)
 
module.exports = withNativeWind(config, { input: './app/global.css' })
