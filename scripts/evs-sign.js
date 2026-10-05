import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// The VMP signature shipped pre-generated in the CastLabs ECS Electron distribution
// is architecture specific, so it never matches between the two slices of a universal
// build. @electron/universal aborts on that ("Expected all plain files ... to have
// identical SHAs"), so it has to be dropped before merging; EVS writes a fresh one
// for the merged app.
const VMP_SIGNATURE_RELATIVE_PATH = path.join(
    'Contents',
    'Frameworks',
    'Electron Framework.framework',
    'Versions',
    'A',
    'Resources',
    'Electron Framework.sig'
);

function removeArchitectureSpecificSignature(appPath) {
    const signaturePath = path.join(appPath, VMP_SIGNATURE_RELATIVE_PATH);
    if (!fs.existsSync(signaturePath)) {
        return false;
    }
    fs.rmSync(signaturePath, { force: true });
    console.log(`Removed architecture specific VMP signature: ${signaturePath}`);
    return true;
}

const _default = async function (context) {
    const { electronPlatformName, appOutDir, packager } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }

    const appPath = path.join(appOutDir, `${packager.appInfo.productFilename}.app`);
    removeArchitectureSpecificSignature(appPath);

    // A universal build packs one app per architecture into `<appOutDir>-<arch>-temp`
    // and merges them afterwards, so this hook runs once per slice plus once for the
    // merged app. Only the merged app is VMP signed.
    if (path.basename(appOutDir).endsWith('-temp')) {
        console.log(`Skipping EVS signing for per-architecture slice: ${appPath}`);
        return;
    }

    console.log('Signing with EVS for macOS...');
    try {
        execSync(`python3 -m castlabs_evs.vmp sign-pkg "${appOutDir}"`, {
            stdio: 'inherit'
        });
        console.log('EVS signing completed successfully');
    } catch (error) {
        console.error('EVS signing failed:', error);
        throw error;
    }
};
export { _default as default };
