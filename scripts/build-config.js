import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const lmsDomain = process.argv[2]; // e.g., lmsdemo.testpress.in
const buildTarget = process.argv[3]; // e.g., windows-appx, all
const osLabel = process.argv[4]; // e.g., windows-latest
const secretKey = process.env.DESKTOP_BUILD_KEY;

if (!lmsDomain) {
  console.error('Error: LMS domain URL is required as an argument.');
  process.exit(1);
}

if (!secretKey) {
  console.error('Error: DESKTOP_BUILD_KEY environment variable is required.');
  process.exit(1);
}

const configApiUrl = `https://${lmsDomain}/api/v3/desktop-build-config/`;

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'X-DESKTOP-BUILD-KEY': secretKey
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Request failed with status ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`Failed to download ${url}: Status ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      file.close(() => {
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    });
  });
}

async function main() {
  try {
    console.log(`Fetching configuration for ${lmsDomain}...`);
    const config = await fetchData(configApiUrl);

    // Validate configuration
    const requiredFields = ['product_name', 'homepage_url', 'app_id'];

    const isAppxTarget = (osLabel === 'windows-latest') && 
                         (buildTarget === 'all' || buildTarget === 'windows-appx');

    if (isAppxTarget) {
      requiredFields.push('microsoft_store_product_id');
    }

    const missingFields = requiredFields.filter(field => !config[field]);
    if (missingFields.length > 0) {
      throw new Error(`Invalid API response: Missing fields [${missingFields.join(', ')}]`);
    }

    // Update app-config.json
    const appConfigPath = path.resolve(__dirname, '../app-config.json');
    const currentAppConfig = JSON.parse(fs.readFileSync(appConfigPath, 'utf8'));
    
    // Only update if values are present to avoid overwriting valid config
    const updatedAppConfig = {
      ...currentAppConfig,
      productName: config.product_name || currentAppConfig.productName,
      homepageURL: config.homepage_url || currentAppConfig.homepageURL,
      appId: config.app_id || currentAppConfig.appId,
      description: config.description || currentAppConfig.description,
      windowsStoreId: config.microsoft_store_product_id || currentAppConfig.windowsStoreId,
    };

    fs.writeFileSync(appConfigPath, JSON.stringify(updatedAppConfig, null, 2));
    console.log('Updated app-config.json');


    // Image mapping
    const imageMap = {
      'icon_icns': 'assets/icon.icns',
      'icon_png': 'assets/icon.png',
      'icon_ico': 'assets/icon.ico',
      'square_44x44_logo': 'build/appx/Square44x44Logo.png',
      'square_150x150_logo': 'build/appx/Square150x150Logo.png',
      'square_310x310_logo': 'build/appx/Square310x310Logo.png',
      'store_logo': 'build/appx/StoreLogo.png',
      'wide_310x150_logo': 'build/appx/Wide310x150Logo.png'
    };

    for (const [apiKey, localPath] of Object.entries(imageMap)) {
      if (config[apiKey]) {
        console.log(`Downloading ${apiKey} to ${localPath}...`);
        await downloadFile(config[apiKey], path.resolve(__dirname, '..', localPath));
      }
    }

    console.log('Configuration sync complete!');
  } catch (error) {
    console.error('Error syncing configuration:', error);
    process.exit(1);
  }
}

main();
