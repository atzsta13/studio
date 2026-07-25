# Security Policy

## The short version

There is no server, no backend, no API, and no user account. The web app is a static export; the Android app bundles its data. **No user data is ever transmitted anywhere** — favourites, notes, budget entries and progress live in `localStorage` (web) or a local Room database and `SharedPreferences` (Android), and never leave the device.

That removes most of the attack surface a normal app has. There is no database to breach, no session to hijack, no credentials to steal, and nothing to leak, because nothing is collected.

## What is still worth reporting

- **Data exfiltration** — anything in the codebase that sends user data off-device. This would be a serious bug and we want to know immediately.
- **Supply chain** — a malicious or compromised dependency in `package.json` or `build.gradle.kts`.
- **XSS via festival data** — festival JSON is contributor-supplied and rendered in the app. A payload that escapes into script execution is a real vulnerability.
- **Android** — exported components, intent redirection, or anything reachable by another app on the device.
- **Service worker** — cache poisoning or a stale-content trap in `public/sw.js`.
- **CI** — a workflow that could be made to run untrusted code from a pull request.

## How to report

Open a [private security advisory](https://github.com/openfestivalhub/openfestivalhub/security/advisories/new) on GitHub. If that isn't available to you, open a normal issue **without exploit details** and say you have a security report.

Please include what you found, how to reproduce it, and what an attacker could actually do with it.

## What to expect

This is a volunteer project with no paid staff and no on-call rotation, so there is no guaranteed response time — but security reports go to the front of the queue ahead of features. There is no bug bounty and no money involved. Credit in the release notes if you'd like it.

## Out of scope

- Missing security headers on GitHub Pages, which we don't control
- Absence of rate limiting, CSRF tokens, or authentication — there is no server and no account, so these have nothing to protect
- Vulnerabilities in the festivals' own websites or their official apps. Those are not ours. Please report them to the festival, not here.
- Wrong or outdated festival data. That's a data bug, not a security issue — open a normal issue.
