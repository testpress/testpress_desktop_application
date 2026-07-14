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
    output: `release/${config.productName}`
  },
  afterPack: "scripts/evs-sign.js",
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
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      },
      {
        target: "appx",
        arch: ["x64"]
      }
    ],
    icon: "assets/icon.ico"
  },
  linux: {
    target: [
      {
        target: "deb",
        arch: ["x64"]
      },
      {
        target: "AppImage",
        arch: ["x64"]
      }
    ],
    category: "Education",
    maintainer: "Testpress <support@testpress.in>",
    icon: "assets/icon-linux.png"
  },
  deb: {
    compression: "gz"
  },
  appx: {
    identityName: config.appId,
    publisher: config.publisherId,
    publisherDisplayName: config.publisherDisplayName,
    displayName: config.productName,
  },
  nsis: {
    oneClick: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: config.productName
  }
};
