# Build an Android APK for Docx.Hub

This project is a PWA-ready web app (manifest, service worker, icons). A native **APK** requires Android build tools (JDK + Android SDK/Gradle/Android Studio). If a full build environment is not available in your current shell, use one of the options below.

## Option 1 (Recommended): Install as an App (PWA, no APK required)
On Android (Chrome/Edge):
1. Serve the project over HTTP(S) (service workers/manifests are limited on `file://`).
2. Open the app URL in Chrome.
3. Tap **⋮** → **Install app** / **Add to Home screen**.

This installs Docx.Hub like an app and keeps it working with the existing offline/app-shell setup.

## Option 2: Generate an APK with PWABuilder
1. Host this folder on HTTPS (e.g. GitHub Pages, Netlify, Vercel, or a local tunnel).
2. Ensure `manifest.webmanifest`, `sw.js`, and icons are reachable.
3. Go to https://www.pwabuilder.com/, enter your app URL, and generate an **Android** package (APK/AAB).
4. Download and sign/install the generated package per PWABuilder instructions.

## Option 3: Build locally with Capacitor (Android Studio)
Prerequisites: Node.js, JDK, Android SDK + Android Studio.

```bash
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init DocxHub com.docxhub.app --web-dir .
npx cap add android
npx cap copy android
npx cap open android
```
Then build a debug/release APK from Android Studio (**Build > Build Bundle(s) / APK(s) > Build APK(s)**).

> Note: Because this is a static multi-page app with local assets/libs, ensure the web assets are copied correctly into the Android project and test file/tool flows on device.

## Current PWA files
- `manifest.webmanifest`
- `sw.js`
- `public/icons/icon.svg`
- Manifest/theme meta + service worker registration in `index.html` and `src/pages/*.html`
