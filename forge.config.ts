import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';

/** Basename (no extension) for @electron/packager: uses .png on Linux, .ico / .icns when you add them beside this name. */
const appIconBase = path.resolve(__dirname, 'assets/MIDI_Practice_Icon_512');
const linuxAppIcon = path.resolve(__dirname, 'assets/MIDI_Practice_Icon_512.png');
const linuxDesktopTemplate = path.resolve(__dirname, 'linux/desktop.ejs');

/** Freedesktop hicolor icons (same PNG scaled by installers); needed for GNOME/KDE app menus / search. */
const linuxHicolorIcons: Record<string, string> = {
    '48x48': linuxAppIcon,
    '64x64': linuxAppIcon,
    '128x128': linuxAppIcon,
    '256x256': linuxAppIcon,
    '512x512': linuxAppIcon,
};

const linuxPackagingOptions = {
    icon: linuxHicolorIcons,
    desktopTemplate: linuxDesktopTemplate,
    /** Must match the running window’s WM class so the shell picks up the .desktop icon in Activities / search. */
    startupWMClass: 'midi_music_practice',
    productName: 'MIDI Music Practice',
    categories: ['Audio', 'AudioVideo', 'Education', 'Utility', 'GNOME', 'GTK'],
};

/** RPM needs `rpmbuild` on PATH; omit MakerRpm unless explicitly requested (see `npm run make:rpm`). */
const includeRpm = process.env.FORGE_MAKE_RPM === '1';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // Linux: MIDI_Practice_Icon_512.png. For Windows add MIDI_Practice_Icon_512.ico; for macOS add MIDI_Practice_Icon_512.icns (same folder).
    icon: appIconBase,
  },
  rebuildConfig: {},
  // Windows installer icon: add assets/MIDI_Practice_Icon_512.ico and set setupIcon in MakerSquirrel.
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ['darwin']),
    ...(includeRpm ? [new MakerRpm({ options: linuxPackagingOptions as never })] : []),
    new MakerDeb({
      options: linuxPackagingOptions as never,
    }),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
