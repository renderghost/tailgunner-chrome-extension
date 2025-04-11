import fs from 'fs';
import { execSync } from 'child_process';

function getManifestVersion() {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf-8'));
    return manifest.version;
}

function getLatestGitTag() {
    try {
        const output = execSync('git tag').toString().trim().split('\n');
        const semverTags = output
            .filter(tag => /^v\d+\.\d+\.\d+$/.test(tag))
            .sort((a, b) => {
                return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });
        return semverTags[semverTags.length - 1] || null;
    } catch (err) {
        return null;
    }
}

function isNewerVersion(newVersion, oldVersion) {
    const toNum = (v) => v.replace(/^v/, '').split('.').map(Number);
    const [n1, n2, n3] = toNum(newVersion);
    const [o1, o2, o3] = toNum(oldVersion);
    return n1 > o1 || (n1 === o1 && n2 > o2) || (n1 === o1 && n2 === o2 && n3 > o3);
}

const manifestVersion = getManifestVersion();
const latestTag = getLatestGitTag();

if (!latestTag || isNewerVersion(manifestVersion, latestTag)) {
    console.log('::set-output name=should_release::true');
    console.log(`::set-output name=next_version::v${manifestVersion}`);
} else {
    console.log('::set-output name=should_release::false');
}