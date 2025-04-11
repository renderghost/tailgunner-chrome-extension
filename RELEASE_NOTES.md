# Release v1.0.1

## What's New
- Added automated build and release pipeline
- Set up GitHub Actions workflow for CRX packaging
- Implemented automatic version checking and tagging
- Added automatic release creation with built extension

## Technical Details
- Implemented automated CRX building using GitHub Actions
- Added version checking script to compare manifest version with latest tag
- Configured secure key management for extension signing
- Set up automatic release creation with attached CRX file

## Installation
The extension can now be installed directly from the release artifacts. Download `tailwind-helper.crx` from this release and drag it into Chrome's extension page.

## For Developers
The build process is now fully automated. When pushing to main:
1. Version number in manifest.json is checked against latest tag
2. If version is newer, a new CRX is built
3. Release is automatically created with the new version tag
4. Built CRX is attached to the release

