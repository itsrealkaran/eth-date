#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🌍 Setting up World ID MiniKit integration...\n");

// Check if @worldcoin/minikit-js is installed
try {
  require("@worldcoin/minikit-js");
  console.log("✅ @worldcoin/minikit-js is already installed");
} catch (error) {
  console.log("❌ @worldcoin/minikit-js is not installed");
  console.log("Please run: npm install @worldcoin/minikit-js\n");
  process.exit(1);
}

// Replace mock files with real implementations
const filesToReplace = [
  {
    from: "hooks/use-world-verification-real.js",
    to: "hooks/use-world-verification.js",
  },
  {
    from: "app/api/verify/route-real.js",
    to: "app/api/verify/route.js",
  },
];

filesToReplace.forEach(({ from, to }) => {
  try {
    if (fs.existsSync(from)) {
      fs.copyFileSync(from, to);
      console.log(`✅ Replaced ${to} with real implementation`);
    } else {
      console.log(`⚠️  Source file ${from} not found`);
    }
  } catch (error) {
    console.log(`❌ Error replacing ${to}:`, error.message);
  }
});

console.log("\n🎉 World ID MiniKit setup complete!");
console.log("\nNext steps:");
console.log("1. Add APP_ID to your .env.local file");
console.log("2. Create an incognito action in the World ID Developer Portal");
console.log("3. Test the verification flow");
console.log("\nFor more details, see setup-world-id.md");
