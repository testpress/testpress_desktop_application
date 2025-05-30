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
    target: ["dmg"],
    category: "public.app-category.education",
    icon: "assets/icon.icns",
    hardenedRuntime: true,
    gatekeeperAssess: true,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.inherit.plist",
    identity: config.identity,
    notarize: true
  },
  electronDownload: {
    "mirror": "https://github.com/castlabs/electron-releases/releases/download/v"
  },
  dmg: {
    sign: false
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
  },
  nsis: {
    oneClick: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: config.productName
  }
};
