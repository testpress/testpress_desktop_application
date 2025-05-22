const config = require('./app-config.json');

module.exports = {
  appId: config.appId,
  productName: config.productName,
  files: [
    "dist/**/*",
    "node_modules/**/*",
    "package.json",
    "assets/**/*",
    "public/**/*",
    "app-config.json"
  ],
  directories: {
    output: "release"
  },
  mac: {
    target: "mas",
    category: "public.app-category.education",
    icon: "assets/icon.icns",
    hardenedRuntime: false,
    gatekeeperAssess: true,
    entitlements: "build/entitlements.mas.plist",
    entitlementsInherit: "build/entitlements.mas.inherit.plist",
    provisioningProfile: config.provisioningProfile,
    identity: config.identity
  },
  mas: {
    type: "distribution"
  },
  masDev: {
    type: "development"
  },
  win: {
    target: ["nsis"],
    icon: "assets/icon.ico"
  }
};
