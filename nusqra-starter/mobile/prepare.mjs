import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { mobileCallback } from './auth.mjs';

process.chdir(fileURLToPath(new URL('../', import.meta.url)));

const [platform, ...unexpected] = process.argv.slice(2);
if (unexpected.length || !['android', 'ios'].includes(platform)) {
  throw new Error('Run npm run mobile:prepare -- android or npm run mobile:prepare -- ios.');
}

const env = loadEnv('production', process.cwd());
if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Set the public Supabase URL and publishable key before building. See .env.example.');
}

const callback = new URL(mobileCallback);
const scheme = callback.protocol.slice(0, -1);
const run = (entry, args) => execFileSync(process.execPath, [entry, ...args], { stdio: 'inherit' });
const cap = (...args) => run('node_modules/@capacitor/cli/bin/capacitor', args);

async function update(path, marker, replacement, appliedMarker) {
  const content = await readFile(path, 'utf8');
  if (content.includes(appliedMarker)) return;
  if (!content.includes(marker)) throw new Error(`Unexpected Capacitor template in ${path}`);
  await writeFile(path, content.replace(marker, replacement));
}

run('node_modules/vite/bin/vite.js', ['build']);
if (!existsSync(platform)) {
  cap('add', platform, ...(platform === 'ios' ? ['--packagemanager', 'SPM'] : []));
} else {
  cap('sync', platform);
}

if (platform === 'android') {
  const main = 'android/app/src/main';
  const manifest = `${main}/AndroidManifest.xml`;
  const closingActivity = '        </activity>';
  await update(manifest, closingActivity, `            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="${scheme}" android:host="${callback.hostname}" android:path="${callback.pathname}" />
            </intent-filter>
${closingActivity}`, `android:scheme="${scheme}"`);
  await update(manifest, 'android:allowBackup="true"', 'android:allowBackup="false"', 'android:allowBackup="false"');

  const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  await Promise.all(Object.entries(densities).flatMap(([density, size]) =>
    ['ic_launcher', 'ic_launcher_round'].map(name =>
      copyFile(`mobile/icons/${size}.png`, `${main}/res/mipmap-${density}/${name}.png`))));
  for (const name of ['ic_launcher', 'ic_launcher_round']) {
    await writeFile(`${main}/res/mipmap-anydpi-v26/${name}.xml`, `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/nusqra_launcher_background" />
    <foreground android:drawable="@drawable/nusqra_launcher_foreground" />
</adaptive-icon>
`);
  }
  await writeFile(`${main}/res/values/nusqra_launcher_background.xml`, '<resources><color name="nusqra_launcher_background">#071B13</color></resources>\n');
  await writeFile(`${main}/res/drawable/nusqra_launcher_foreground.xml`, `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
    <path android:pathData="M34,75V33L74,75V33" android:strokeColor="#2FE39A"
        android:strokeWidth="7" android:strokeLineCap="square" android:strokeLineJoin="miter" />
</vector>
`);
} else {
  const root = 'ios/App/App';
  await update(`${root}/Info.plist`, '  <key>CAPACITOR_DEBUG</key>', `  <key>CFBundleURLTypes</key>
  <array>
    <dict>
      <key>CFBundleURLName</key>
      <string>${scheme}.auth</string>
      <key>CFBundleURLSchemes</key>
      <array><string>${scheme}</string></array>
    </dict>
  </array>
  <key>CAPACITOR_DEBUG</key>`, '<key>CFBundleURLTypes</key>');
  await copyFile('mobile/icons/1024.png', `${root}/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`);
}
