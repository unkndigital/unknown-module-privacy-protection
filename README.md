# Privacy Protection

Known LG ACR, voice, telemetry/ad and discovery service blockers, with a local protection log.

**Public experimental release 1.1.1.** This repository contains only this module, its build tools and its installable ZIP. Unknown Core is a separate prerequisite; the legacy unkndigital/unknown-home repository is not the modular Core installer.

## Prerequisites

- Install only on a TV you own, with existing owner-controlled root and Unknown Core 0.8.3 or newer. No rooting exploit, LG credentials, firmware or service-login bypass is supplied.
- Keep independent recovery access and backups. Modules execute trusted code with root privileges; they are not sandboxed.
- Read [module behavior and restoration](MODULE.md), [owner-use boundaries](OWNER_USE.md), and [security limits](SECURITY.md).

## Build

On Windows, run **Build.cmd**. It checks Node.js 20+ and npm, installs locked dependencies, checks source and creates a validated module ZIP. It does not connect to a TV or publish anything.

    npm ci --ignore-scripts
    npm test
    npm run build

Output: dist/privacy-protection-1.1.1.zip and dist/SHA256SUMS.txt. PC architecture is independent of the TV JavaScript runtime. The initial reviewed candidate ZIP and its checksum are also at the repository root. Checksums verify bytes, not publisher identity or safety.

## Install

In Core, choose Install Modules from GitHub and enter https://github.com/unkndigital/unknown-module-privacy-protection. Select the module ZIP from Releases and review it before installation. Activation is a separate choice. You can also transfer the module ZIP to /media/internal/.unknown-core/modules-inbox through your owner-controlled connection. Use the module ZIP, not GitHub's automatic source-code ZIP.

## Updates

Use [Unknown Core](https://github.com/unkndigital/unknown-core) 0.8.3 or newer. Open Updates, choose Check for updates, then Review this module's available release before applying it. Updates retain saved module settings and ON/OFF state and create a local backup. Update Core first when required. Nothing updates unattended. Keep independent recovery access: backups cannot undo every effect of root code, and power loss can interrupt installation.

## Verification Recovery in 1.1.1

Requires Core 0.8.3. Verification errors retain saved choices and existing protection changes, show a persistent Core warning, record the failure, and retry during maintenance. A successful verification records recovery. Explicit OFF and emergency recovery still run cleanup. This does not guarantee protection when verification is unavailable.

If an older release already quarantined these modules, use Disable and restore to clear the old recovery state for Microphone Protection first, then Privacy Protection. Apply Core 0.8.3 and both 1.1.1 protection updates. Enable Privacy Protection before Microphone Protection, then check the requested options and run their health checks. Saved module choices are retained; inspect them rather than assuming every option is ON.

On one owner-controlled LG C4 / webOS 25 TV, the tested builds verified 19 known LG executable blocks and 11 detected ALSA capture-node blocks. A process-read failure was injected without removing existing blocks; its warning persisted and recovered after reboot. Multiple automatic maintenance cycles and eight declared module health checks passed. Early boot, proprietary capture paths, all app tracking and complete network isolation remain outside this verification.

## Scope and Verification

Removes this module's temporary service blocks, allowing those LG services to run again. Saved preferences and logs are retained. Microphone Protection depends on this module and must be turned off first.

Only one LG C4 / webOS 25 owner-device has been used for integration checks. Other models and firmware versions are unverified. Workspace tests cover module contracts; this standalone build checks syntax, manifest rules and archive integrity without executing TV actions. A successful build is not proof of hardware compatibility. No TV logs, personal settings, keys, research payloads or private YouTube helper are included.

## License and Attribution

MIT licensed. Retain the full license and **Unknown Digital and Unknown Suite contributors** copyright notice in copies or substantial portions, including modified versions. Preserve third-party notices. Owner-only project/support rules do not add restrictions to MIT. The license's warranty and liability limitations apply to the extent permitted by law, not as a guarantee against claims. Independent of LG and not endorsed by LG, GitHub or FULU.
