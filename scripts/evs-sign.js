import { execSync } from 'child_process';

const _default = async function (context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName === 'darwin') {
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
    }
};
export { _default as default };
