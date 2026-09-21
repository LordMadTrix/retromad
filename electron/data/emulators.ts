import { EmulatorProfile } from '../types';

export const BUILTIN_EMULATORS: EmulatorProfile[] = [
  {
    id: 'retroarch',
    name: 'RetroArch (Natif)',
    category: 'retroarch',
    executableLinux: '/usr/bin/retroarch',
    executableWindows: 'C:\\RetroArch-Win64\\retroarch.exe',
    argsTemplateLinux: '-L {corePath} "{rom}"',
    argsTemplateWindows: '-L {corePath} "{rom}"',
    supportedSystems: ['all']
  },
  {
    id: 'retroarch-flatpak',
    name: 'RetroArch (Flatpak)',
    category: 'flatpak',
    executableLinux: 'flatpak',
    executableWindows: '',
    argsTemplateLinux: 'run org.libretro.RetroArch -L {coreName} "{rom}"',
    argsTemplateWindows: '',
    supportedSystems: ['all']
  },
  {
    id: 'duckstation',
    name: 'DuckStation (PlayStation)',
    category: 'standalone',
    executableLinux: 'duckstation-qt',
    executableWindows: 'duckstation-qt-x64-ReleaseLTCG.exe',
    argsTemplateLinux: '-batch -fullscreen "{rom}"',
    argsTemplateWindows: '-batch -fullscreen "{rom}"',
    supportedSystems: ['psx']
  },
  {
    id: 'pcsx2',
    name: 'PCSX2 (PlayStation 2)',
    category: 'standalone',
    executableLinux: 'pcsx2-qt',
    executableWindows: 'pcsx2-qt.exe',
    argsTemplateLinux: '-fullscreen -nogui "{rom}"',
    argsTemplateWindows: '-fullscreen -nogui "{rom}"',
    supportedSystems: ['ps2']
  },
  {
    id: 'mgba',
    name: 'mGBA (Game Boy / Advance)',
    category: 'standalone',
    executableLinux: 'mgba-qt',
    executableWindows: 'mGBA.exe',
    argsTemplateLinux: '-f "{rom}"',
    argsTemplateWindows: '-f "{rom}"',
    supportedSystems: ['gba', 'gbc', 'gb']
  },
  {
    id: 'snes9x',
    name: 'Snes9x (Super Nintendo)',
    category: 'standalone',
    executableLinux: 'snes9x-gtk',
    executableWindows: 'snes9x-x64.exe',
    argsTemplateLinux: '"{rom}"',
    argsTemplateWindows: '"{rom}"',
    supportedSystems: ['snes']
  },
  {
    id: 'flycast',
    name: 'Flycast (Dreamcast)',
    category: 'standalone',
    executableLinux: 'flycast',
    executableWindows: 'flycast.exe',
    argsTemplateLinux: '"{rom}"',
    argsTemplateWindows: '"{rom}"',
    supportedSystems: ['dreamcast']
  },
  {
    id: 'dolphin',
    name: 'Dolphin (GameCube & Wii)',
    category: 'standalone',
    executableLinux: 'dolphin-emu',
    executableWindows: 'Dolphin.exe',
    argsTemplateLinux: '-b -e "{rom}"',
    argsTemplateWindows: '-b -e "{rom}"',
    supportedSystems: ['gamecube', 'wii']
  },
  {
    id: 'cemu',
    name: 'Cemu (Wii U)',
    category: 'standalone',
    executableLinux: 'cemu',
    executableWindows: 'Cemu.exe',
    argsTemplateLinux: '-f -g "{rom}"',
    argsTemplateWindows: '-f -g "{rom}"',
    supportedSystems: ['wiiu']
  },
  {
    id: 'ryujinx',
    name: 'Ryujinx (Nintendo Switch)',
    category: 'standalone',
    executableLinux: 'ryujinx',
    executableWindows: 'Ryujinx.exe',
    argsTemplateLinux: '"{rom}"',
    argsTemplateWindows: '"{rom}"',
    supportedSystems: ['switch']
  },
  {
    id: 'melonds',
    name: 'melonDS (Nintendo DS)',
    category: 'standalone',
    executableLinux: 'melonDS',
    executableWindows: 'melonDS.exe',
    argsTemplateLinux: '"{rom}"',
    argsTemplateWindows: '"{rom}"',
    supportedSystems: ['nds']
  },
  {
    id: 'citra',
    name: 'Citra / Lime3DS (Nintendo 3DS)',
    category: 'standalone',
    executableLinux: 'lime3ds',
    executableWindows: 'lime3ds-qt.exe',
    argsTemplateLinux: '"{rom}"',
    argsTemplateWindows: '"{rom}"',
    supportedSystems: ['3ds']
  },
  {
    id: 'rpcs3',
    name: 'RPCS3 (PlayStation 3)',
    category: 'standalone',
    executableLinux: 'rpcs3',
    executableWindows: 'rpcs3.exe',
    argsTemplateLinux: '--no-gui "{rom}"',
    argsTemplateWindows: '--no-gui "{rom}"',
    supportedSystems: ['ps3']
  },
  {
    id: 'shadps4',
    name: 'shadPS4 (PlayStation 4)',
    category: 'standalone',
    executableLinux: 'shadps4',
    executableWindows: 'shadps4.exe',
    argsTemplateLinux: '"{rom}"',
    argsTemplateWindows: '"{rom}"',
    supportedSystems: ['ps4']
  },
  {
    id: 'vita3k',
    name: 'Vita3K (PlayStation Vita)',
    category: 'standalone',
    executableLinux: 'Vita3K',
    executableWindows: 'Vita3K.exe',
    argsTemplateLinux: '-r "{rom}"',
    argsTemplateWindows: '-r "{rom}"',
    supportedSystems: ['psvita']
  },
  {
    id: 'xemu',
    name: 'xemu (Microsoft Xbox)',
    category: 'standalone',
    executableLinux: 'xemu',
    executableWindows: 'xemu.exe',
    argsTemplateLinux: '-dvd_path "{rom}"',
    argsTemplateWindows: '-dvd_path "{rom}"',
    supportedSystems: ['xbox']
  },
  {
    id: 'xenia',
    name: 'Xenia (Microsoft Xbox 360)',
    category: 'standalone',
    executableLinux: 'xenia',
    executableWindows: 'xenia.exe',
    argsTemplateLinux: '"{rom}"',
    argsTemplateWindows: '"{rom}"',
    supportedSystems: ['xbox360']
  }
];
