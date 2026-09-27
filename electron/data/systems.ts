import { System } from '../types';
import { MUSEUM_DATA } from './museumData';

const RAW_SYSTEMS: System[] = [
  // NINTENDO
  {
    id: 'nes',
    name: 'Nintendo Entertainment System',
    shortName: 'NES',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 1983,
    generation: '3e génération (8-bit)',
    specs: {
      cpu: 'Ricoh 2A03 (8-bit) @ 1.79 MHz',
      gpuOrAudio: 'PPU 2C02 / 5 canaux audio (PSG)',
      resolution: '256x240 pixels (54 couleurs max)',
      media: 'Cartouches ROM (128 KB - 1 MB)',
      unitsSold: '61.91 millions'
    },
    extensions: ['.nes', '.fds', '.unf', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Nintendo_Entertainment_System',
    defaultCoreLinux: 'fceumm_libretro.so',
    defaultCoreWindows: 'fceumm_libretro.dll',
    subfolder: 'nes',
    icon: 'Gamepad2',
    themeColor: '#e60012',
    logoUrl: './logos/consoles/nes.png',
    biosList: [
      { filename: 'disksys.rom', description: 'Famicom Disk System BIOS (Optionnel pour disquettes FDS)', md5: 'ca30b50f880eb660a32069da365b69ad', optional: true }
    ]
  },
  {
    id: 'snes',
    name: 'Super Nintendo',
    shortName: 'SNES',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 1990,
    generation: '4e génération (16-bit)',
    specs: {
      cpu: 'Ricoh 5A22 (16-bit) @ 3.58 MHz',
      gpuOrAudio: 'Sony SPC700 (DSP 8 canaux ADPCM)',
      resolution: '256x224 à 512x448 (Mode 7, 32 768 couleurs)',
      media: 'Cartouches ROM (jusqu\'à 6 MB)',
      unitsSold: '49.10 millions'
    },
    extensions: ['.sfc', '.smc', '.fig', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Super_Nintendo_Entertainment_System',
    defaultCoreLinux: 'snes9x_libretro.so',
    defaultCoreWindows: 'snes9x_libretro.dll',
    subfolder: 'snes',
    icon: 'Tv',
    themeColor: '#7928ca',
    logoUrl: './logos/consoles/snes.png',
    biosList: []
  },
  {
    id: 'n64',
    name: 'Nintendo 64',
    shortName: 'N64',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 1996,
    generation: '5e génération (64-bit)',
    specs: {
      cpu: 'NEC VR4300 (64-bit RISC) @ 93.75 MHz',
      gpuOrAudio: 'SGI RCP (Reality Coprocessor) @ 62.5 MHz',
      resolution: '320x240 à 640x480 (Anti-aliasing hardware)',
      media: 'Cartouches ROM (4 MB - 64 MB)',
      unitsSold: '32.93 millions'
    },
    extensions: ['.n64', '.z64', '.v64', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Nintendo_64',
    defaultCoreLinux: 'mupen64plus_next_libretro.so',
    defaultCoreWindows: 'mupen64plus_next_libretro.dll',
    subfolder: 'n64',
    icon: 'Box',
    themeColor: '#00ff88',
    logoUrl: './logos/consoles/n64.png',
    biosList: []
  },
  {
    id: 'gb',
    name: 'Game Boy',
    shortName: 'GB',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 1989,
    generation: '4e génération (Portable 8-bit)',
    specs: {
      cpu: 'Sharp LR35902 (hybride Z80/8080) @ 4.19 MHz',
      gpuOrAudio: 'Écran LCD monochrome 4 nuances de gris',
      resolution: '160x144 pixels',
      media: 'Cartouches Game Boy (32 KB - 1 MB)',
      unitsSold: '118.69 millions (avec GBC)'
    },
    extensions: ['.gb', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Game_Boy',
    defaultCoreLinux: 'gambatte_libretro.so',
    defaultCoreWindows: 'gambatte_libretro.dll',
    subfolder: 'gb',
    icon: 'Smartphone',
    themeColor: '#8a9ea7',
    logoUrl: './logos/consoles/gb.png',
    biosList: [
      { filename: 'gb_bios.bin', description: 'Game Boy Boot ROM (Animation Nintendo)', md5: '32fbbd84168d3482956eb3c5051637f5', optional: true }
    ]
  },
  {
    id: 'gbc',
    name: 'Game Boy Color',
    shortName: 'GBC',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 1998,
    generation: '5e génération (Portable 8-bit)',
    specs: {
      cpu: 'Sharp LR35902 double vitesse @ 8.38 MHz',
      gpuOrAudio: 'Écran LCD couleur TFT (jusqu\'à 56 couleurs)',
      resolution: '160x144 pixels',
      media: 'Cartouches Game Boy Color',
      unitsSold: '118.69 millions (cumulé avec GB)'
    },
    extensions: ['.gbc', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Game_Boy_Color',
    defaultCoreLinux: 'gambatte_libretro.so',
    defaultCoreWindows: 'gambatte_libretro.dll',
    subfolder: 'gbc',
    icon: 'Smartphone',
    themeColor: '#9b51e0',
    logoUrl: './logos/consoles/gbc.png',
    biosList: [
      { filename: 'gbc_bios.bin', description: 'Game Boy Color Boot ROM', md5: 'dbfce91485635aac61f8c219d1691339', optional: true }
    ]
  },
  {
    id: 'gba',
    name: 'Game Boy Advance',
    shortName: 'GBA',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 2001,
    generation: '6e génération (Portable 32-bit)',
    specs: {
      cpu: 'ARM7TDMI (32-bit RISC) @ 16.78 MHz + Z80',
      gpuOrAudio: 'Écran LCD TFT 240x160 (32 768 couleurs)',
      resolution: '240x160 pixels',
      media: 'Cartouches GBA (4 MB - 32 MB)',
      unitsSold: '81.51 millions'
    },
    extensions: ['.gba', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Game_Boy_Advance',
    defaultCoreLinux: 'mgba_libretro.so',
    defaultCoreWindows: 'mgba_libretro.dll',
    subfolder: 'gba',
    icon: 'Smartphone',
    themeColor: '#304ffe',
    logoUrl: './logos/consoles/gba.png',
    biosList: [
      { filename: 'gba_bios.bin', description: 'Game Boy Advance Official BIOS', md5: 'a860e8c0b6d573d191e4ec7db1b1e4f6', optional: true }
    ]
  },

  // SEGA
  {
    id: 'mastersystem',
    name: 'Sega Master System',
    shortName: 'Master System',
    companyId: 'sega',
    manufacturer: 'SEGA',
    releaseYear: 1985,
    generation: '3e génération (8-bit)',
    specs: {
      cpu: 'Zilog Z80 @ 3.58 MHz',
      gpuOrAudio: 'VDP Texas Instruments SN76489',
      resolution: '256x192 (32 couleurs simultanées)',
      media: 'Cartouches et Sega Cards',
      unitsSold: '13 millions (succès majeur au Brésil & Europe)'
    },
    extensions: ['.sms', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Sega_-_Master_System_-_Mark_III',
    defaultCoreLinux: 'genesis_plus_gx_libretro.so',
    defaultCoreWindows: 'genesis_plus_gx_libretro.dll',
    subfolder: 'mastersystem',
    icon: 'Tv',
    themeColor: '#006699',
    logoUrl: './logos/consoles/mastersystem.png',
    biosList: []
  },
  {
    id: 'megadrive',
    name: 'Sega Mega Drive / Genesis',
    shortName: 'Mega Drive',
    companyId: 'sega',
    manufacturer: 'SEGA',
    releaseYear: 1988,
    generation: '4e génération (16-bit)',
    specs: {
      cpu: 'Motorola 68000 @ 7.6 MHz + Zilog Z80 @ 3.58 MHz',
      gpuOrAudio: 'Yamaha YM2612 (FM 6 canaux) + PSG SN76489',
      resolution: '320x224 (64 couleurs parmi 512)',
      media: 'Cartouches ROM (jusqu\'à 4-5 MB)',
      unitsSold: '30.75 millions'
    },
    extensions: ['.md', '.gen', '.smd', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Sega_-_Mega_Drive_-_Genesis',
    defaultCoreLinux: 'genesis_plus_gx_libretro.so',
    defaultCoreWindows: 'genesis_plus_gx_libretro.dll',
    subfolder: 'megadrive',
    icon: 'Gamepad2',
    themeColor: '#00a8ff',
    logoUrl: './logos/consoles/megadrive.png',
    biosList: []
  },
  {
    id: 'gamegear',
    name: 'Sega Game Gear',
    shortName: 'Game Gear',
    companyId: 'sega',
    manufacturer: 'SEGA',
    releaseYear: 1990,
    generation: '4e génération (Portable 8-bit)',
    specs: {
      cpu: 'Zilog Z80 @ 3.58 MHz',
      gpuOrAudio: 'Écran couleur rétroéclairé 3.2 pouces',
      resolution: '160x144 pixels (32 couleurs parmi 4096)',
      media: 'Cartouches Game Gear',
      unitsSold: '10.62 millions'
    },
    extensions: ['.gg', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Sega_-_Game_Gear',
    defaultCoreLinux: 'genesis_plus_gx_libretro.so',
    defaultCoreWindows: 'genesis_plus_gx_libretro.dll',
    subfolder: 'gamegear',
    icon: 'Smartphone',
    themeColor: '#0097e6',
    logoUrl: './logos/consoles/gamegear.png',
    biosList: []
  },
  {
    id: 'saturn',
    name: 'Sega Saturn',
    shortName: 'Saturn',
    companyId: 'sega',
    manufacturer: 'SEGA',
    releaseYear: 1994,
    generation: '5e génération (32-bit)',
    specs: {
      cpu: '2x Hitachi SH-2 (32-bit RISC) @ 28.6 MHz + 6 autres puces',
      gpuOrAudio: 'VDP1 (sprites 2D/quads 3D) + VDP2 + Yamaha SCSP',
      resolution: '352x240 à 704x480',
      media: 'CD-ROM double vitesse (650 MB)',
      unitsSold: '9.26 millions'
    },
    extensions: ['.cue', '.iso', '.chd', '.bin', '.mdf'],
    libretroSystemName: 'Sega_-_Saturn',
    defaultCoreLinux: 'beetle_saturn_libretro.so',
    defaultCoreWindows: 'beetle_saturn_libretro.dll',
    subfolder: 'saturn',
    icon: 'Disc',
    themeColor: '#44bd32',
    logoUrl: './logos/consoles/saturn.png',
    biosList: [
      { filename: 'saturn_bios.bin', description: 'SEGA Saturn BIOS (Europe/US/Japon)', md5: 'af5832142838c5d29222e4a2f1d88b96', optional: false },
      { filename: 'sega_101.bin', description: 'SEGA Saturn Japanese BIOS v1.01', md5: '85ec9ca47d8f6807718151cbcca8b964', optional: true }
    ]
  },
  {
    id: 'dreamcast',
    name: 'Sega Dreamcast',
    shortName: 'Dreamcast',
    companyId: 'sega',
    manufacturer: 'SEGA',
    releaseYear: 1998,
    generation: '6e génération (128-bit)',
    specs: {
      cpu: 'Hitachi SH-4 (128-bit FPU) @ 200 MHz',
      gpuOrAudio: 'NEC PowerVR2 CLX2 @ 100 MHz + Yamaha AICA',
      resolution: '640x480 (Sortie VGA native 480p 60fps)',
      media: 'GD-ROM (1.2 GB)',
      unitsSold: '9.13 millions'
    },
    extensions: ['.cdi', '.gdi', '.chd', '.iso'],
    libretroSystemName: 'Sega_-_Dreamcast',
    defaultCoreLinux: 'flycast_libretro.so',
    defaultCoreWindows: 'flycast_libretro.dll',
    subfolder: 'dreamcast',
    icon: 'Disc',
    themeColor: '#e1b12c',
    logoUrl: './logos/consoles/dreamcast.png',
    biosList: [
      { filename: 'dc_boot.bin', description: 'Dreamcast Main Boot BIOS', md5: 'e10c53c2f8b90bab96ead2d368858623', optional: false },
      { filename: 'dc_flash.bin', description: 'Dreamcast Flash NVRAM', md5: '74e3f69c2bb92bc1e4d96fbab342e472', optional: false }
    ]
  },

  // SONY
  {
    id: 'psx',
    name: 'Sony PlayStation',
    shortName: 'PlayStation (PS1)',
    companyId: 'sony',
    manufacturer: 'Sony',
    releaseYear: 1994,
    generation: '5e génération (32-bit)',
    specs: {
      cpu: 'MIPS R3000A (32-bit RISC) @ 33.86 MHz',
      gpuOrAudio: 'GPU Sony (180k polygones texturés/sec) + SPU 24 voix',
      resolution: '256x224 à 640x480 (True color 24-bit)',
      media: 'CD-ROM double vitesse (650 MB)',
      unitsSold: '102.49 millions'
    },
    extensions: ['.cue', '.iso', '.chd', '.pbp', '.bin', '.mdf'],
    libretroSystemName: 'Sony_-_PlayStation',
    defaultCoreLinux: 'swanstation_libretro.so',
    defaultCoreWindows: 'swanstation_libretro.dll',
    subfolder: 'psx',
    icon: 'Disc',
    themeColor: '#003791',
    logoUrl: './logos/consoles/psx.png',
    biosList: [
      { filename: 'scph5501.bin', description: 'PlayStation USA BIOS SCPH-5501 (Recommandé)', md5: '924e392ed05545d11874dcb3cbde8502', optional: false },
      { filename: 'scph5502.bin', description: 'PlayStation Europe BIOS SCPH-5502 (PAL)', md5: '32736f17079d0b2b7024407779bd3050', optional: true },
      { filename: 'scph5500.bin', description: 'PlayStation Japon BIOS SCPH-5500 (NTSC-J)', md5: 'ff3eeb8c664e05dce6d36935d86d3bed', optional: true }
    ]
  },
  {
    id: 'ps2',
    name: 'Sony PlayStation 2',
    shortName: 'PS2',
    companyId: 'sony',
    manufacturer: 'Sony',
    releaseYear: 2000,
    generation: '6e génération (128-bit)',
    specs: {
      cpu: 'Emotion Engine (128-bit) @ 294 MHz',
      gpuOrAudio: 'Graphics Synthesizer @ 147 MHz (4 MB eDRAM)',
      resolution: '480i, 480p, 720p, 1080i',
      media: 'DVD-ROM (4.7 GB / 8.5 GB) & CD-ROM',
      unitsSold: '158+ millions (Console la plus vendue de l\'Histoire)'
    },
    extensions: ['.iso', '.chd', '.bin', '.gz', '.cso'],
    libretroSystemName: 'Sony_-_PlayStation_2',
    defaultCoreLinux: 'pcsx2_libretro.so',
    defaultCoreWindows: 'pcsx2_libretro.dll',
    subfolder: 'ps2',
    icon: 'Disc',
    themeColor: '#002561',
    logoUrl: './logos/consoles/ps2.png',
    biosList: [
      { filename: 'scph39001.bin', description: 'PlayStation 2 USA BIOS SCPH-39001', md5: 'd5ce2c7d1108ab9e5c4e97677d2ef1df', optional: false }
    ]
  },
  {
    id: 'psp',
    name: 'PlayStation Portable',
    shortName: 'PSP',
    companyId: 'sony',
    manufacturer: 'Sony',
    releaseYear: 2004,
    generation: '7e génération (Portable)',
    specs: {
      cpu: 'MIPS R4000 (32-bit) cadencé jusqu\'à 333 MHz',
      gpuOrAudio: 'GPU 166 MHz (2 MB VRAM) + Écran LCD 16:9 4.3 pouces',
      resolution: '480x272 pixels (16.7 millions de couleurs)',
      media: 'Disque UMD (Universal Media Disc - 1.8 GB)',
      unitsSold: '80.79 millions'
    },
    extensions: ['.iso', '.cso', '.pbp', '.chd'],
    libretroSystemName: 'Sony_-_PlayStation_Portable',
    defaultCoreLinux: 'ppsspp_libretro.so',
    defaultCoreWindows: 'ppsspp_libretro.dll',
    subfolder: 'psp',
    icon: 'Smartphone',
    themeColor: '#2f3542',
    logoUrl: './logos/consoles/psp.png',
    biosList: []
  },

  // SNK
  {
    id: 'neogeo',
    name: 'SNK Neo-Geo MVS/AES',
    shortName: 'Neo-Geo',
    companyId: 'snk',
    manufacturer: 'SNK',
    releaseYear: 1990,
    generation: '4e génération (Arcade / 24-bit Marketing)',
    specs: {
      cpu: 'Motorola 68000 @ 12 MHz + Zilog Z80 @ 4 MHz',
      gpuOrAudio: '380 sprites simultanés, Yamaha YM2610 (15 canaux)',
      resolution: '320x224 (4 096 couleurs simultanées)',
      media: 'Cartouches géantes MVS/AES (jusqu\'à 716 Megabits)',
      unitsSold: 'Succès légendaire des salles d\'arcade mondiales'
    },
    extensions: ['.zip', '.7z'],
    libretroSystemName: 'SNK_-_Neo_Geo',
    defaultCoreLinux: 'fbneo_libretro.so',
    defaultCoreWindows: 'fbneo_libretro.dll',
    subfolder: 'neogeo',
    icon: 'Gamepad2',
    themeColor: '#ffcc00',
    logoUrl: './logos/consoles/neogeo.png',
    biosList: [
      { filename: 'neogeo.zip', description: 'Neo-Geo Universal BIOS Archive (MVS/AES/UniBIOS)', optional: false }
    ]
  },

  // NEC
  {
    id: 'pcengine',
    name: 'PC-Engine / TurboGrafx-16',
    shortName: 'PC Engine',
    companyId: 'nec',
    manufacturer: 'NEC',
    releaseYear: 1987,
    generation: '4e génération (8/16-bit hybride)',
    specs: {
      cpu: 'Hudson Soft HuC6280 (8-bit) @ 7.16 MHz',
      gpuOrAudio: 'HuC6260 VCE + HuC6270 VDC (Processeur vidéo 16-bit)',
      resolution: '256x240 à 512x240 (512 couleurs max)',
      media: 'HuCard (cartes de la taille d\'une carte de crédit) & CD-ROM²',
      unitsSold: '10 millions'
    },
    extensions: ['.pce', '.cue', '.iso', '.chd', '.zip', '.7z'],
    libretroSystemName: 'NEC_-_PC_Engine_-_TurboGrafx_16',
    defaultCoreLinux: 'mednafen_pce_fast_libretro.so',
    defaultCoreWindows: 'mednafen_pce_fast_libretro.dll',
    subfolder: 'pcengine',
    icon: 'Tv',
    themeColor: '#ea5404',
    logoUrl: './logos/consoles/pcengine.png',
    biosList: [
      { filename: 'syscard3.pce', description: 'Super CD-ROM² System Card v3.00 (Pour jeux CD)', md5: '3817d3243ac68a17234394364f9c2937', optional: true }
    ]
  },

  // ATARI
  {
    id: 'atari2600',
    name: 'Atari 2600 (VCS)',
    shortName: 'Atari 2600',
    companyId: 'atari',
    manufacturer: 'Atari',
    releaseYear: 1977,
    generation: '2e génération (8-bit)',
    specs: {
      cpu: 'MOS Technology 6507 @ 1.19 MHz',
      gpuOrAudio: 'TIA (Television Interface Adapter) / 128 octets de RAM !',
      resolution: '160x192 pixels',
      media: 'Cartouches ROM (2 KB - 32 KB)',
      unitsSold: '30 millions'
    },
    extensions: ['.a26', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Atari_-_2600',
    defaultCoreLinux: 'stella_libretro.so',
    defaultCoreWindows: 'stella_libretro.dll',
    subfolder: 'atari2600',
    icon: 'Gamepad2',
    themeColor: '#e31b23',
    logoUrl: './logos/consoles/atari2600.png',
    biosList: []
  },

  // ==========================================
  // CONSOLES NEXT-GEN & MODERNES
  // ==========================================

  // NINTENDO NEXT-GEN
  {
    id: 'gamecube',
    name: 'Nintendo GameCube',
    shortName: 'GameCube',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 2001,
    generation: '6e génération (128-bit)',
    specs: {
      cpu: 'IBM PowerPC Gekko @ 485 MHz',
      gpuOrAudio: 'ATI Flipper @ 162 MHz / Macronix DSP 16-bit 81 MHz',
      resolution: '480i / 480p EDTV',
      media: 'Mini-DVD optiques propriétaires (1.5 GB)',
      unitsSold: '21.74 millions'
    },
    extensions: ['.iso', '.gcm', '.rvz', '.cso', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_GameCube',
    defaultCoreLinux: 'dolphin_libretro.so',
    defaultCoreWindows: 'dolphin_libretro.dll',
    subfolder: 'gamecube',
    icon: 'Box',
    themeColor: '#6b5b95',
    logoUrl: './logos/consoles/gamecube.png',
    biosList: []
  },
  {
    id: 'wii',
    name: 'Nintendo Wii',
    shortName: 'Wii',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 2006,
    generation: '7e génération',
    specs: {
      cpu: 'IBM PowerPC Broadway @ 729 MHz',
      gpuOrAudio: 'ATI Hollywood @ 243 MHz, Wiimote & Nunchuk à détection de mouvement',
      resolution: '480p Component',
      media: 'Disques optiques Wii 12cm (4.7 GB / 8.5 GB)',
      unitsSold: '101.63 millions'
    },
    extensions: ['.wbfs', '.iso', '.rvz', '.cso', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Wii',
    defaultCoreLinux: 'dolphin_libretro.so',
    defaultCoreWindows: 'dolphin_libretro.dll',
    subfolder: 'wii',
    icon: 'Tv',
    themeColor: '#00bfff',
    logoUrl: './logos/consoles/wii.png',
    biosList: []
  },
  {
    id: 'wiiu',
    name: 'Nintendo Wii U',
    shortName: 'Wii U',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 2012,
    generation: '8e génération (HD)',
    specs: {
      cpu: 'IBM PowerPC Espresso Tri-Core @ 1.24 GHz',
      gpuOrAudio: 'AMD Radeon Latte @ 550 MHz, GamePad tactile asynchrone',
      resolution: '1080p, 1080i, 720p',
      media: 'Disques optiques haute densité Wii U (25 GB)',
      unitsSold: '13.56 millions'
    },
    extensions: ['.wua', '.rpx', '.wud', '.wux', '.iso'],
    libretroSystemName: 'Nintendo_-_Wii_U',
    defaultCoreLinux: 'cemu',
    defaultCoreWindows: 'Cemu.exe',
    subfolder: 'wiiu',
    icon: 'Tv',
    themeColor: '#009ac7',
    logoUrl: './logos/consoles/wiiu.png',
    biosList: []
  },
  {
    id: 'switch',
    name: 'Nintendo Switch',
    shortName: 'Switch',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 2017,
    generation: '8e/9e génération hybride',
    specs: {
      cpu: 'NVIDIA Tegra X1 personnalisé (4x Cortex-A57 + 4x Cortex-A53)',
      gpuOrAudio: 'NVIDIA Maxwell 256 cœurs CUDA, Joy-Cons avec vibrations HD',
      resolution: '720p portable / 1080p mode téléviseur dock',
      media: 'Cartouches de jeu Switch (jusqu\'à 64 GB)',
      unitsSold: 'Plus de 143 millions'
    },
    extensions: ['.nsp', '.xci', '.nca'],
    libretroSystemName: 'Nintendo_-_Nintendo_Switch',
    defaultCoreLinux: 'ryujinx',
    defaultCoreWindows: 'Ryujinx.exe',
    subfolder: 'switch',
    icon: 'Gamepad2',
    themeColor: '#e60012',
    logoUrl: './logos/consoles/switch.png',
    biosList: [
      { filename: 'prod.keys', description: 'Nintendo Switch Decryption Keys (Indispensable)', optional: false }
    ]
  },
  {
    id: 'nds',
    name: 'Nintendo DS',
    shortName: 'Nintendo DS',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 2004,
    generation: '7e génération portable',
    specs: {
      cpu: 'ARM946E-S @ 67 MHz + ARM7TDMI @ 33 MHz',
      gpuOrAudio: 'Double écran LCD avec dalle tactile inférieure et stylet',
      resolution: '256x192 pixels par écran',
      media: 'Cartouches Nintendo DS (8 MB - 512 MB)',
      unitsSold: '154.02 millions'
    },
    extensions: ['.nds', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Nintendo_DS',
    defaultCoreLinux: 'melonds_libretro.so',
    defaultCoreWindows: 'melonds_libretro.dll',
    subfolder: 'nds',
    icon: 'Smartphone',
    themeColor: '#a0a0a0',
    logoUrl: './logos/consoles/nds.png',
    biosList: [
      { filename: 'bios7.bin', description: 'ARM7 BIOS (Optionnel pour melonDS)', optional: true },
      { filename: 'bios9.bin', description: 'ARM9 BIOS (Optionnel pour melonDS)', optional: true },
      { filename: 'firmware.bin', description: 'NDS Firmware (Optionnel pour melonDS)', optional: true }
    ]
  },
  {
    id: '3ds',
    name: 'Nintendo 3DS',
    shortName: 'Nintendo 3DS',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 2011,
    generation: '8e génération portable',
    specs: {
      cpu: 'Dual-Core ARM11 MPCore @ 268 MHz',
      gpuOrAudio: 'DMP PICA200 GPU, écran supérieur 3D autostéréoscopique sans lunettes',
      resolution: '800x240 (400x240 par œil 3D) + 320x240 tactile',
      media: 'Cartouches Nintendo 3DS (jusqu\'à 8 GB)',
      unitsSold: '75.94 millions'
    },
    extensions: ['.3ds', '.cia', '.cxi', '.app', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Nintendo_3DS',
    defaultCoreLinux: 'citra_libretro.so',
    defaultCoreWindows: 'citra_libretro.dll',
    subfolder: '3ds',
    icon: 'Smartphone',
    themeColor: '#d12229',
    logoUrl: './logos/consoles/3ds.png',
    biosList: []
  },

  // SONY NEXT-GEN
  {
    id: 'ps3',
    name: 'Sony PlayStation 3',
    shortName: 'PlayStation 3',
    companyId: 'sony',
    manufacturer: 'Sony',
    releaseYear: 2006,
    generation: '7e génération (HD)',
    specs: {
      cpu: 'Cell Broadband Engine (1 PPE 3.2 GHz + 7 SPEs vectoriels)',
      gpuOrAudio: 'NVIDIA RSX "Reality Synthesizer" @ 550 MHz, lecteur Blu-ray Disc',
      resolution: '720p, 1080i, 1080p HDMI',
      media: 'Disques Blu-ray PlayStation 3 (25 GB / 50 GB)',
      unitsSold: '87.4 millions'
    },
    extensions: ['.iso', '.bin', '.pkg', '.zip', '.7z'],
    libretroSystemName: 'Sony_-_PlayStation_3',
    defaultCoreLinux: 'rpcs3',
    defaultCoreWindows: 'rpcs3.exe',
    subfolder: 'ps3',
    icon: 'Disc',
    themeColor: '#003791',
    logoUrl: './logos/consoles/ps3.png',
    biosList: [
      { filename: 'PS3UPDAT.PUP', description: 'Firmware officiel PlayStation 3 (Indispensable pour RPCS3)', optional: false }
    ]
  },
  {
    id: 'ps4',
    name: 'Sony PlayStation 4',
    shortName: 'PlayStation 4',
    companyId: 'sony',
    manufacturer: 'Sony',
    releaseYear: 2013,
    generation: '8e génération (Full HD)',
    specs: {
      cpu: 'AMD Jaguar 8 cœurs x86-64 @ 1.6 GHz',
      gpuOrAudio: 'AMD Radeon GCN 1.84 TFLOPS, 8 GB mémoire unifiée GDDR5',
      resolution: '1080p 60fps / 4K HDR',
      media: 'Disques Blu-ray 50 GB',
      unitsSold: '117.2 millions'
    },
    extensions: ['.pkg', '.iso'],
    libretroSystemName: 'Sony_-_PlayStation_4',
    defaultCoreLinux: 'shadps4',
    defaultCoreWindows: 'shadps4.exe',
    subfolder: 'ps4',
    icon: 'Disc',
    themeColor: '#003791',
    logoUrl: './logos/consoles/ps4.png',
    biosList: []
  },
  {
    id: 'psvita',
    name: 'Sony PlayStation Vita',
    shortName: 'PS Vita',
    companyId: 'sony',
    manufacturer: 'Sony',
    releaseYear: 2011,
    generation: '8e génération portable',
    specs: {
      cpu: 'Quad-Core ARM Cortex-A9 MPCore @ 444 MHz',
      gpuOrAudio: 'PowerVR SGX543MP4+, splendide écran OLED 5" tactile et pavé tactile arrière',
      resolution: '960x544 pixels qHD',
      media: 'Cartes NVRAM PlayStation Vita',
      unitsSold: '16 millions'
    },
    extensions: ['.vpk', '.zip', '.pkg'],
    libretroSystemName: 'Sony_-_PlayStation_Vita',
    defaultCoreLinux: 'vita3k',
    defaultCoreWindows: 'Vita3K.exe',
    subfolder: 'psvita',
    icon: 'Smartphone',
    themeColor: '#0072ce',
    logoUrl: './logos/consoles/psvita.png',
    biosList: [
      { filename: 'PSP2UPDAT.PUP', description: 'Firmware officiel PlayStation Vita (Pour Vita3K)', optional: false }
    ]
  },

  // MICROSOFT NEXT-GEN
  {
    id: 'xbox',
    name: 'Microsoft Xbox',
    shortName: 'Xbox',
    companyId: 'microsoft',
    manufacturer: 'Microsoft',
    releaseYear: 2001,
    generation: '6e génération',
    specs: {
      cpu: 'Intel Pentium III Coppermine @ 733 MHz',
      gpuOrAudio: 'NVIDIA NV2A @ 233 MHz, Disque dur interne 8 GB, Port Ethernet intégré',
      resolution: '480p, 720p, 1080i',
      media: 'DVD-ROM double couche (8.5 GB)',
      unitsSold: '24 millions'
    },
    extensions: ['.iso', '.xiso'],
    libretroSystemName: 'Microsoft_-_Xbox',
    defaultCoreLinux: 'xemu',
    defaultCoreWindows: 'xemu.exe',
    subfolder: 'xbox',
    icon: 'Box',
    themeColor: '#107c10',
    logoUrl: './logos/consoles/xbox.png',
    biosList: [
      { filename: 'mcpx_1.0.bin', description: 'MCPX Boot ROM v1.0 (Indispensable pour xemu)', optional: false },
      { filename: 'Complex_4627.bin', description: 'Xbox BIOS ROM (Indispensable pour xemu)', optional: false }
    ]
  },
  {
    id: 'xbox360',
    name: 'Microsoft Xbox 360',
    shortName: 'Xbox 360',
    companyId: 'microsoft',
    manufacturer: 'Microsoft',
    releaseYear: 2005,
    generation: '7e génération (HD)',
    specs: {
      cpu: 'IBM Xenon Tri-Core PowerPC @ 3.2 GHz (6 threads simultanés)',
      gpuOrAudio: 'ATI Xenos 500 MHz avec 10 MB eDRAM fille, pionnière du Xbox Live',
      resolution: '720p, 1080i, 1080p',
      media: 'DVD-ROM 8.5 GB',
      unitsSold: '84.7 millions'
    },
    extensions: ['.iso', '.xex'],
    libretroSystemName: 'Microsoft_-_Xbox_360',
    defaultCoreLinux: 'xenia',
    defaultCoreWindows: 'xenia.exe',
    subfolder: 'xbox360',
    icon: 'Tv',
    themeColor: '#52b043',
    logoUrl: './logos/consoles/xbox360.png',
    biosList: []
  },

  // ATARI SUPPLÉMENTAIRES
  {
    id: 'atari7800',
    name: 'Atari 7800 ProSystem',
    shortName: 'Atari 7800',
    companyId: 'atari',
    manufacturer: 'Atari',
    releaseYear: 1986,
    generation: '3e génération (8-bit)',
    specs: {
      cpu: 'MOS Technology 6502C @ 1.79 MHz',
      gpuOrAudio: 'Maria (160 sprites couleur simultanés)',
      resolution: '160x240 ou 320x240',
      media: 'Cartouches ROM (4 KB - 48 KB)',
      unitsSold: '3.77 millions'
    },
    extensions: ['.a78', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Atari_-_7800',
    defaultCoreLinux: 'prosystem_libretro.so',
    defaultCoreWindows: 'prosystem_libretro.dll',
    subfolder: 'atari7800',
    icon: 'Gamepad2',
    themeColor: '#f0a500',
    logoUrl: './logos/consoles/atari7800.png',
    biosList: [
      { filename: '7800 BIOS (U).rom', description: 'Atari 7800 BIOS US', md5: '0763f1ffb006ddbe32e52d497ee848ae', optional: true }
    ]
  },
  {
    id: 'lynx',
    name: 'Atari Lynx',
    shortName: 'Lynx',
    companyId: 'atari',
    manufacturer: 'Atari',
    releaseYear: 1989,
    generation: '4e génération (Portable 16-bit)',
    specs: {
      cpu: 'WDC 65SC02 @ 4 MHz + Motorola 6502 custom',
      gpuOrAudio: 'Suzy (co-processeur graphique matériel) + Mikey (son)',
      resolution: '160x102 pixels (4096 couleurs !)',
      media: 'Cartouches Lynx (128 KB - 512 KB)',
      unitsSold: '2 millions'
    },
    extensions: ['.lnx', '.zip', '.7z'],
    libretroSystemName: 'Atari_-_Lynx',
    defaultCoreLinux: 'mednafen_lynx_libretro.so',
    defaultCoreWindows: 'mednafen_lynx_libretro.dll',
    subfolder: 'lynx',
    icon: 'Smartphone',
    themeColor: '#ff6b35',
    logoUrl: './logos/consoles/lynx.png',
    biosList: [
      { filename: 'lynxboot.img', description: 'Atari Lynx Boot ROM', md5: 'fcd403db69f54290b51035d82f835e7b', optional: false }
    ]
  },

  // SEGA SUPPLÉMENTAIRE
  {
    id: 'sega32x',
    name: 'Sega 32X (Super 32X)',
    shortName: 'Sega 32X',
    companyId: 'sega',
    manufacturer: 'SEGA',
    releaseYear: 1994,
    generation: '5e génération (32-bit, extension Mega Drive)',
    specs: {
      cpu: '2x Hitachi SH-2 @ 23 MHz',
      gpuOrAudio: 'VDP custom + PWM stéréo 2 canaux',
      resolution: '320x224 (32 768 couleurs simultanées !)',
      media: 'Cartouches 32X sur Mega Drive',
      unitsSold: '800 000 (commercial échec)'
    },
    extensions: ['.32x', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Sega_-_32X',
    defaultCoreLinux: 'picodrive_libretro.so',
    defaultCoreWindows: 'picodrive_libretro.dll',
    subfolder: 'sega32x',
    icon: 'Gamepad2',
    themeColor: '#cc0000',
    logoUrl: './logos/consoles/sega32x.png',
    biosList: []
  },

  // SNK SUPPLÉMENTAIRE
  {
    id: 'ngpc',
    name: 'SNK Neo Geo Pocket Color',
    shortName: 'Neo Geo Pocket Color',
    companyId: 'snk',
    manufacturer: 'SNK',
    releaseYear: 1999,
    generation: '5e génération (Portable 16-bit)',
    specs: {
      cpu: 'Toshiba TLCS-900H (16-bit) @ 6.144 MHz + Z80 @ 3.072 MHz',
      gpuOrAudio: 'Écran LCD couleur TFT 2.7 pouces (146 couleurs parmi 4096)',
      resolution: '160x152 pixels',
      media: 'Cartouches Neo Geo Pocket',
      unitsSold: '2 millions'
    },
    extensions: ['.ngc', '.ngp', '.zip', '.7z'],
    libretroSystemName: 'SNK_-_Neo_Geo_Pocket_Color',
    defaultCoreLinux: 'mednafen_ngp_libretro.so',
    defaultCoreWindows: 'mednafen_ngp_libretro.dll',
    subfolder: 'ngpc',
    icon: 'Smartphone',
    themeColor: '#e6b800',
    logoUrl: './logos/consoles/ngpc.png',
    biosList: []
  },

  // COMMODORE
  {
    id: 'c64',
    name: 'Commodore 64',
    shortName: 'C64',
    companyId: 'commodore',
    manufacturer: 'Commodore',
    releaseYear: 1982,
    generation: '2e génération (Micro-ordinateur 8-bit)',
    specs: {
      cpu: 'MOS Technology 6510 @ 0.985-1.023 MHz',
      gpuOrAudio: 'VIC-II (16 couleurs, sprites hardware) + SID 6581 (3 voix oscillateurs)',
      resolution: '320x200 ou 160x200 en multicoleur',
      media: 'Cassettes, Disquettes 5.25" et Cartouches ROM',
      unitsSold: "17 millions (ordinateur le plus vendu de l'Histoire !)"
    },
    extensions: ['.d64', '.t64', '.tap', '.prg', '.crt', '.zip', '.7z'],
    libretroSystemName: 'Commodore_-_64',
    defaultCoreLinux: 'vice_x64_libretro.so',
    defaultCoreWindows: 'vice_x64_libretro.dll',
    subfolder: 'c64',
    icon: 'Cpu',
    themeColor: '#8b6fc2',
    logoUrl: './logos/consoles/c64.png',
    biosList: []
  },
  {
    id: 'amiga',
    name: 'Commodore Amiga 500',
    shortName: 'Amiga',
    companyId: 'commodore',
    manufacturer: 'Commodore',
    releaseYear: 1987,
    generation: '4e génération (Micro-ordinateur 16/32-bit)',
    specs: {
      cpu: 'Motorola 68000 @ 7.09 MHz + co-processeurs Agnus, Denise, Paula',
      gpuOrAudio: 'Custom chipset 32 couleurs / 64 EHB / 4096 HAM + 4 canaux audio Paula',
      resolution: '320x200 à 720x576 (toutes résolutions !)',
      media: 'Disquettes 3.5" Double Densité (880 KB) et CD-ROM (sur Amiga 1200/CD32)',
      unitsSold: '4.85 millions'
    },
    extensions: ['.adf', '.adz', '.dms', '.fdi', '.ipf', '.hdf', '.lha', '.zip', '.7z'],
    libretroSystemName: 'Commodore_-_Amiga',
    defaultCoreLinux: 'puae_libretro.so',
    defaultCoreWindows: 'puae_libretro.dll',
    subfolder: 'amiga',
    icon: 'Cpu',
    themeColor: '#ff6600',
    logoUrl: './logos/consoles/amiga.png',
    biosList: [
      { filename: 'kick34005.A500', description: 'AmigaOS Kickstart ROM v1.3 (Amiga 500 - indispensable)', md5: '82a21c1890cae844b3df741f2762d48d', optional: false },
      { filename: 'kick40063.A600', description: 'AmigaOS Kickstart ROM v3.1 (Amiga 600)', md5: 'e40a5dfb3d017ba8779faba30cbd1c8e', optional: true }
    ]
  },

  // ARCADE / MULTI-SYSTÈMES
  {
    id: 'mame',
    name: 'Arcade MAME / FinalBurn Neo',
    shortName: 'Arcade',
    companyId: 'multiple',
    manufacturer: 'Multi-fabricants',
    releaseYear: 1978,
    generation: 'Arcade multi-systèmes',
    specs: {
      cpu: 'Multi-architectures (Z80, 68000, ARM, x86...)',
      gpuOrAudio: "Authentique audio d'arcade (YM2151, YM3812, CPS)",
      resolution: 'Variable (240p à 480p selon le jeu)',
      media: 'Archives ZIP de ROMs Arcade',
      unitsSold: 'Des millions de bornes dans le monde'
    },
    extensions: ['.zip', '.7z', '.chd'],
    libretroSystemName: 'MAME',
    defaultCoreLinux: 'mame_libretro.so',
    defaultCoreWindows: 'mame_libretro.dll',
    subfolder: 'arcade',
    icon: 'Joystick',
    themeColor: '#ff0080',
    logoUrl: './logos/consoles/arcade.png',
    biosList: []
  },
  {
    id: 'msx2',
    name: 'MSX2 (Standard Japonais)',
    shortName: 'MSX2',
    companyId: 'multiple',
    manufacturer: 'Multi-fabricants',
    releaseYear: 1985,
    generation: '3e génération (Micro-ordinateur 8-bit)',
    specs: {
      cpu: 'Zilog Z80A @ 3.58 MHz',
      gpuOrAudio: 'V9938 MSX-Video (512 couleurs, sprites hardware) + AY-3-8910 PSG 3 voix',
      resolution: '256x192 à 512x212',
      media: 'Cartouches ROM et Disquettes 3.5"',
      unitsSold: '5 millions'
    },
    extensions: ['.rom', '.ri', '.mx1', '.mx2', '.dsk', '.cas', '.zip', '.7z'],
    libretroSystemName: 'Microsoft_-_MSX2',
    defaultCoreLinux: 'bluemsx_libretro.so',
    defaultCoreWindows: 'bluemsx_libretro.dll',
    subfolder: 'msx2',
    icon: 'Cpu',
    themeColor: '#1e90ff',
    logoUrl: './logos/consoles/msx2.png',
    biosList: [
      { filename: 'MSX2.ROM', description: 'MSX2 BIOS ROM (indispensable)', optional: false },
      { filename: 'MSX2EXT.ROM', description: 'MSX2 Extended BIOS ROM', optional: false }
    ]
  },

  // ==========================================
  // NOUVELLES CONSOLES — NINTENDO
  // ==========================================

  {
    id: 'virtualboy',
    name: 'Nintendo Virtual Boy',
    shortName: 'Virtual Boy',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 1995,
    generation: '5e génération (3D stéréoscopique)',
    specs: {
      cpu: 'NEC V810 (32-bit RISC) @ 20 MHz',
      gpuOrAudio: 'VIP (Virtual Image Processor) — rendu stéréoscopique rouge monochrome',
      resolution: '384x224 pixels par œil (rouge monochrome uniquement)',
      media: 'Cartouches Virtual Boy (512 KB - 16 MB)',
      unitsSold: '0.77 million (échec commercial)'
    },
    extensions: ['.vb', '.vboy', '.zip', '.7z'],
    libretroSystemName: 'Nintendo_-_Virtual_Boy',
    defaultCoreLinux: 'mednafen_vb_libretro.so',
    defaultCoreWindows: 'mednafen_vb_libretro.dll',
    subfolder: 'virtualboy',
    icon: 'Eye',
    themeColor: '#cc0000',
    logoUrl: './logos/consoles/virtualboy.png',
    biosList: []
  },
  {
    id: 'n64dd',
    name: 'Nintendo 64DD',
    shortName: 'N64DD',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 1999,
    generation: '5e génération (Extension disque magnétique)',
    specs: {
      cpu: 'NEC VR4300 64-bit RISC @ 93.75 MHz (N64 + extension DD)',
      gpuOrAudio: 'SGI RCP + Disque magnétique amovible 64 MB réinscriptible',
      resolution: '320x240 à 640x480 (identique N64)',
      media: 'Disques magnétiques 64DD (64 MB, réinscriptibles)',
      unitsSold: '~15 000 (Japon uniquement, abonnement service Randnet)'
    },
    extensions: ['.ndd', '.zip'],
    libretroSystemName: 'Nintendo_-_Nintendo_64DD',
    defaultCoreLinux: 'mupen64plus_next_libretro.so',
    defaultCoreWindows: 'mupen64plus_next_libretro.dll',
    subfolder: 'n64dd',
    icon: 'Disc',
    themeColor: '#e60012',
    logoUrl: './logos/consoles/n64.png',
    biosList: []
  },

  // ==========================================
  // NOUVELLES CONSOLES — SEGA
  // ==========================================

  {
    id: 'segacd',
    name: 'Sega Mega-CD / Sega CD',
    shortName: 'Mega-CD',
    companyId: 'sega',
    manufacturer: 'SEGA',
    releaseYear: 1991,
    generation: '4e génération (Extension CD-ROM)',
    specs: {
      cpu: 'Motorola 68000 @ 12.5 MHz (add-on) + 68000 Mega Drive @ 7.6 MHz',
      gpuOrAudio: 'Puce PCM 8 canaux + CD-ROM simple vitesse 650 MB + mise à l\'échelle/rotation hardware',
      resolution: '320x224 (héritée Mega Drive) avec transitions et effets CD',
      media: 'CD-ROM simple vitesse (650 MB)',
      unitsSold: '6 millions (cumulé Sega CD + Mega-CD)'
    },
    extensions: ['.bin', '.iso', '.chd', '.cue', '.zip'],
    libretroSystemName: 'Sega_-_Mega_CD_-_Sega_CD',
    defaultCoreLinux: 'genesis_plus_gx_libretro.so',
    defaultCoreWindows: 'genesis_plus_gx_libretro.dll',
    subfolder: 'segacd',
    icon: 'Disc',
    themeColor: '#00a0dc',
    logoUrl: './logos/consoles/segacd.png',
    biosList: [
      { filename: 'bios_CD_E.bin', description: 'Mega-CD Europe BIOS (PAL)', md5: 'e66fa1dc5820d254611fdcdba0662372', optional: false },
      { filename: 'bios_CD_J.bin', description: 'Mega-CD Japon BIOS (NTSC-J)', md5: '278a9397d192149e84e820ac621a8edd', optional: false },
      { filename: 'bios_CD_U.bin', description: 'Sega CD USA BIOS (NTSC-U)', md5: '2efd74e3232ff260e371b099e9e3d790', optional: false }
    ]
  },
  {
    id: 'sg1000',
    name: 'Sega SG-1000',
    shortName: 'SG-1000',
    companyId: 'sega',
    manufacturer: 'SEGA',
    releaseYear: 1983,
    generation: '2e génération (8-bit)',
    specs: {
      cpu: 'Zilog Z80A @ 3.58 MHz',
      gpuOrAudio: 'Texas Instruments TMS9918A + SN76489 PSG 3 voix',
      resolution: '256x192 pixels (16 couleurs)',
      media: 'Cartouches ROM (8 KB - 48 KB)',
      unitsSold: '~400 000 (Japon, Océanie, Asie)'
    },
    extensions: ['.sg', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Sega_-_SG-1000',
    defaultCoreLinux: 'gearsystem_libretro.so',
    defaultCoreWindows: 'gearsystem_libretro.dll',
    subfolder: 'sg1000',
    icon: 'Gamepad2',
    themeColor: '#1a1a2e',
    logoUrl: './logos/consoles/sg1000.png',
    biosList: []
  },

  // ==========================================
  // NOUVELLES CONSOLES — ATARI
  // ==========================================

  {
    id: 'atari5200',
    name: 'Atari 5200 SuperSystem',
    shortName: 'Atari 5200',
    companyId: 'atari',
    manufacturer: 'Atari',
    releaseYear: 1982,
    generation: '2e génération (8-bit)',
    specs: {
      cpu: 'MOS 6502C @ 1.79 MHz',
      gpuOrAudio: 'GTIA + POKEY (4 voix audio, timer, entrées) + ANTIC (co-processeur affichage)',
      resolution: '320x192 (256 couleurs)',
      media: 'Cartouches ROM (16 KB - 32 KB)',
      unitsSold: '1 million'
    },
    extensions: ['.a52', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Atari_-_5200',
    defaultCoreLinux: 'a5200_libretro.so',
    defaultCoreWindows: 'a5200_libretro.dll',
    subfolder: 'atari5200',
    icon: 'Gamepad2',
    themeColor: '#d2691e',
    logoUrl: './logos/consoles/atari5200.png',
    biosList: [
      { filename: '5200.rom', description: 'Atari 5200 BIOS (Requis)', md5: '281f20ea4320404ec820fb7ec0693b38', optional: false }
    ]
  },
  {
    id: 'jaguar',
    name: 'Atari Jaguar',
    shortName: 'Jaguar',
    companyId: 'atari',
    manufacturer: 'Atari',
    releaseYear: 1993,
    generation: '5e génération (64-bit marketing)',
    specs: {
      cpu: 'Motorola 68000 @ 13.3 MHz + Tom (RISC GPU) + Jerry (DSP audio) @ 26.6 MHz',
      gpuOrAudio: 'Tom + Jerry (co-processeurs RISC 32-bit) — "64-bit" bus de données',
      resolution: '320x200 à 720x576 (modes variables)',
      media: 'Cartouches ROM (jusqu\'à 6 MB)',
      unitsSold: '250 000 (échec commercial)'
    },
    extensions: ['.j64', '.jag', '.zip', '.7z'],
    libretroSystemName: 'Atari_-_Jaguar',
    defaultCoreLinux: 'virtualjaguar_libretro.so',
    defaultCoreWindows: 'virtualjaguar_libretro.dll',
    subfolder: 'jaguar',
    icon: 'Gamepad2',
    themeColor: '#c41e3a',
    logoUrl: './logos/consoles/jaguar.png',
    biosList: []
  },

  // ==========================================
  // NOUVELLES CONSOLES — MICROSOFT
  // ==========================================

  {
    id: 'xboxone',
    name: 'Microsoft Xbox One',
    shortName: 'Xbox One',
    companyId: 'microsoft',
    manufacturer: 'Microsoft',
    releaseYear: 2013,
    generation: '8e génération (Full HD)',
    specs: {
      cpu: 'AMD x86-64 8 cœurs (Jaguar) @ 1.75 GHz',
      gpuOrAudio: 'AMD GCN @ 853 MHz (1.4 TFLOPS), 8 GB mémoire DDR3 unifiée',
      resolution: '1080p 60fps / 4K UHD partiel',
      media: 'Disques Blu-ray 50 GB',
      unitsSold: '58 millions (toutes versions Xbox One)'
    },
    extensions: ['.xbla', '.zip'],
    libretroSystemName: 'Microsoft_-_Xbox_One',
    defaultCoreLinux: 'xemu',
    defaultCoreWindows: 'xemu.exe',
    subfolder: 'xboxone',
    icon: 'Tv',
    themeColor: '#107c10',
    logoUrl: './logos/consoles/xboxone.png',
    biosList: []
  },

  // ==========================================
  // NOUVELLES CONSOLES — SNK
  // ==========================================

  {
    id: 'ngp',
    name: 'SNK Neo Geo Pocket',
    shortName: 'Neo Geo Pocket',
    companyId: 'snk',
    manufacturer: 'SNK',
    releaseYear: 1998,
    generation: '5e génération (Portable 16-bit, monochrome)',
    specs: {
      cpu: 'Toshiba TLCS-900H (16-bit) @ 6.144 MHz + Z80 @ 3.072 MHz',
      gpuOrAudio: 'Écran LCD monochrome 2.7 pouces (96 nuances de gris)',
      resolution: '160x152 pixels',
      media: 'Cartouches Neo Geo Pocket',
      unitsSold: '~1 million (Japon, version mono)'
    },
    extensions: ['.ngp', '.zip', '.7z'],
    libretroSystemName: 'SNK_-_Neo_Geo_Pocket',
    defaultCoreLinux: 'mednafen_ngp_libretro.so',
    defaultCoreWindows: 'mednafen_ngp_libretro.dll',
    subfolder: 'ngp',
    icon: 'Smartphone',
    themeColor: '#888800',
    logoUrl: './logos/consoles/ngp.png',
    biosList: []
  },

  // ==========================================
  // NOUVELLES CONSOLES — AUTRES FABRICANTS
  // ==========================================

  {
    id: '3do',
    name: '3DO Interactive Multiplayer',
    shortName: '3DO',
    companyId: 'panasonic',
    manufacturer: 'Panasonic / The 3DO Company',
    releaseYear: 1993,
    generation: '5e génération (32-bit)',
    specs: {
      cpu: 'ARM60 @ 12.5 MHz + 2 co-processeurs graphiques (CEL Engine)',
      gpuOrAudio: 'DSP VDLP (Video Display List Processor) + 16 voix PCM stéréo',
      resolution: '320x240 à 640x480',
      media: 'CD-ROM simple vitesse (650 MB)',
      unitsSold: '2 millions'
    },
    extensions: ['.iso', '.bin', '.chd', '.cue'],
    libretroSystemName: 'The_3DO_Company_-_3DO',
    defaultCoreLinux: 'opera_libretro.so',
    defaultCoreWindows: 'opera_libretro.dll',
    subfolder: '3do',
    icon: 'Disc',
    themeColor: '#4a4a8f',
    logoUrl: './logos/consoles/3do.png',
    biosList: [
      { filename: 'panafz1.bin', description: 'Panasonic FZ-1 3DO BIOS (Requis)', md5: 'f47264dd47fe30f73ab3c010015c155b', optional: false }
    ]
  },
  {
    id: 'vectrex',
    name: 'GCE Vectrex',
    shortName: 'Vectrex',
    companyId: 'gce',
    manufacturer: 'GCE / Milton Bradley',
    releaseYear: 1982,
    generation: '2e génération (Vectoriel intégré)',
    specs: {
      cpu: 'Motorola MC68A09 (8/16-bit) @ 1.5 MHz',
      gpuOrAudio: 'Affichage vectoriel intégré 9 pouces (noir et blanc) + AY-3-8912 PSG 3 voix',
      resolution: 'Vectoriel (résolution infinie — pas de pixels !)',
      media: 'Cartouches ROM (4 KB - 32 KB)',
      unitsSold: '~500 000'
    },
    extensions: ['.vec', '.bin', '.zip', '.7z'],
    libretroSystemName: 'GCE_-_Vectrex',
    defaultCoreLinux: 'vecx_libretro.so',
    defaultCoreWindows: 'vecx_libretro.dll',
    subfolder: 'vectrex',
    icon: 'Monitor',
    themeColor: '#f0f000',
    logoUrl: './logos/consoles/vectrex.png',
    biosList: []
  },
  {
    id: 'colecovision',
    name: 'ColecoVision',
    shortName: 'ColecoVision',
    companyId: 'coleco',
    manufacturer: 'Coleco Industries',
    releaseYear: 1982,
    generation: '2e génération (8-bit)',
    specs: {
      cpu: 'Zilog Z80A @ 3.58 MHz',
      gpuOrAudio: 'Texas Instruments TMS9928A + SN76489 PSG 3 voix + 1 bruit blanc',
      resolution: '256x192 pixels (16 couleurs)',
      media: 'Cartouches ROM (8 KB - 32 KB)',
      unitsSold: '2 millions'
    },
    extensions: ['.col', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Coleco_-_ColecoVision',
    defaultCoreLinux: 'bluemsx_libretro.so',
    defaultCoreWindows: 'bluemsx_libretro.dll',
    subfolder: 'colecovision',
    icon: 'Gamepad2',
    themeColor: '#1c1c6b',
    logoUrl: './logos/consoles/colecovision.png',
    biosList: [
      { filename: 'colecovision.rom', description: 'ColecoVision BIOS (Requis)', md5: '2c66f5911e5b42b8ebe113403548eee7', optional: false }
    ]
  },
  {
    id: 'intellivision',
    name: 'Mattel Intellivision',
    shortName: 'Intellivision',
    companyId: 'mattel',
    manufacturer: 'Mattel Electronics',
    releaseYear: 1979,
    generation: '2e génération (16-bit)',
    specs: {
      cpu: 'General Instrument CP1610 (16-bit) @ 0.895 MHz',
      gpuOrAudio: 'STIC (Standard Television Interface Chip) + PSG 3 voix GI AY-3-8914',
      resolution: '159x96 pixels (16 couleurs)',
      media: 'Cartouches ROM (4 KB - 52 KB)',
      unitsSold: '3 millions'
    },
    extensions: ['.int', '.bin', '.zip', '.7z'],
    libretroSystemName: 'Mattel_-_Intellivision',
    defaultCoreLinux: 'freeintv_libretro.so',
    defaultCoreWindows: 'freeintv_libretro.dll',
    subfolder: 'intellivision',
    icon: 'Gamepad2',
    themeColor: '#8b4513',
    logoUrl: './logos/consoles/intellivision.png',
    biosList: [
      { filename: 'exec.bin', description: 'Intellivision Executive ROM (Requis)', md5: 'cbfb3941d1ed91ceae9a9e0f7f0c3bf8', optional: false },
      { filename: 'grom.bin', description: 'Intellivision GROM (Graphics ROM, Requis)', md5: '0cd5946c6473e42e8e4c2137785e427f', optional: false }
    ]
  },
  {
    id: 'pcenginecd',
    name: 'NEC PC Engine CD-ROM²',
    shortName: 'PC Engine CD',
    companyId: 'nec',
    manufacturer: 'NEC Home Electronics',
    releaseYear: 1988,
    generation: '4e génération (Extension CD-ROM)',
    specs: {
      cpu: 'Hudson Soft HuC6280 (8-bit) @ 7.16 MHz + lecteur CD-ROM simple vitesse',
      gpuOrAudio: 'HuC6260 VCE + HuC6270 VDC + CD audio stéréo 44.1 kHz (qualité Hi-Fi)',
      resolution: '256x240 à 512x240',
      media: 'CD-ROM simple vitesse (650 MB)',
      unitsSold: 'Inclus dans les 10 millions de PC Engine (extension très populaire au Japon)'
    },
    extensions: ['.pce', '.chd', '.cue', '.iso', '.zip'],
    libretroSystemName: 'NEC_-_PC_Engine_CD_-_TurboGrafx_CD',
    defaultCoreLinux: 'mednafen_pce_libretro.so',
    defaultCoreWindows: 'mednafen_pce_libretro.dll',
    subfolder: 'pcenginecd',
    icon: 'Disc',
    themeColor: '#ff4500',
    logoUrl: './logos/consoles/pcenginecd.png',
    biosList: [
      { filename: 'syscard3.pce', description: 'Super CD-ROM² System Card v3.00 (Requis pour jeux CD)', md5: '3817d3243ac68a17234394364f9c2937', optional: false }
    ]
  },
  {
    id: 'wonderswan',
    name: 'Bandai WonderSwan',
    shortName: 'WonderSwan',
    companyId: 'bandai',
    manufacturer: 'Bandai',
    releaseYear: 1999,
    generation: '5e génération (Portable monochrome)',
    specs: {
      cpu: 'NEC V30MZ (16-bit, compatible x86) @ 3.072 MHz',
      gpuOrAudio: 'Écran LCD monochrome 2.49 pouces + 4 voix audio (ondes carrées)',
      resolution: '224x144 pixels (monochrome)',
      media: 'Cartouches WonderSwan (1 MB - 64 MB)',
      unitsSold: '3.5 millions (toutes versions WonderSwan confondues)'
    },
    extensions: ['.ws', '.zip', '.7z'],
    libretroSystemName: 'Bandai_-_WonderSwan',
    defaultCoreLinux: 'mednafen_wswan_libretro.so',
    defaultCoreWindows: 'mednafen_wswan_libretro.dll',
    subfolder: 'wonderswan',
    icon: 'Smartphone',
    themeColor: '#cccccc',
    logoUrl: './logos/consoles/wonderswan.png',
    biosList: []
  },
  {
    id: 'wonderswancolor',
    name: 'Bandai WonderSwan Color',
    shortName: 'WonderSwan Color',
    companyId: 'bandai',
    manufacturer: 'Bandai',
    releaseYear: 2000,
    generation: '5e génération (Portable couleur)',
    specs: {
      cpu: 'NEC V30MZ (16-bit) @ 3.072 MHz',
      gpuOrAudio: 'Écran LCD couleur TFT 2.49 pouces (241 couleurs parmi 4096)',
      resolution: '224x144 pixels (4096 couleurs)',
      media: 'Cartouches WonderSwan Color (1 MB - 64 MB)',
      unitsSold: 'Inclus dans les 3.5 millions WonderSwan (version Color dominante)'
    },
    extensions: ['.wsc', '.zip', '.7z'],
    libretroSystemName: 'Bandai_-_WonderSwan_Color',
    defaultCoreLinux: 'mednafen_wswan_libretro.so',
    defaultCoreWindows: 'mednafen_wswan_libretro.dll',
    subfolder: 'wonderswancolor',
    icon: 'Smartphone',
    themeColor: '#ff6699',
    logoUrl: './logos/consoles/wonderswancolor.png',
    biosList: []
  },

  // ==========================================
  // NOUVELLES CONSOLES — ORDINATEURS
  // ==========================================

  {
    id: 'atarist',
    name: 'Atari ST',
    shortName: 'Atari ST',
    companyId: 'atari',
    manufacturer: 'Atari',
    releaseYear: 1985,
    generation: '4e génération (Micro-ordinateur 16/32-bit)',
    specs: {
      cpu: 'Motorola 68000 (16/32-bit) @ 8 MHz',
      gpuOrAudio: 'Chip graphique personnalisé (16 couleurs parmi 512) + YM2149 PSG 3 voix',
      resolution: '320x200 (16 couleurs) ou 640x400 (monochrome)',
      media: 'Disquettes 3.5" 720 KB et 1.44 MB',
      unitsSold: '~4 millions (succès massif en Europe)'
    },
    extensions: ['.st', '.stx', '.dim', '.msa', '.zip', '.7z'],
    libretroSystemName: 'Atari_-_ST',
    defaultCoreLinux: 'hatari_libretro.so',
    defaultCoreWindows: 'hatari_libretro.dll',
    subfolder: 'atarist',
    icon: 'Cpu',
    themeColor: '#888888',
    logoUrl: './logos/consoles/atarist.png',
    biosList: [
      { filename: 'tos.img', description: 'Atari ST TOS ROM (Requis — TOS 1.02 recommandé)', optional: false }
    ]
  },
  {
    id: 'msx',
    name: 'MSX (Standard Microsoft / ASCII)',
    shortName: 'MSX',
    companyId: 'multiple',
    manufacturer: 'Multi-fabricants',
    releaseYear: 1983,
    generation: '2e génération (Micro-ordinateur 8-bit)',
    specs: {
      cpu: 'Zilog Z80 @ 3.58 MHz',
      gpuOrAudio: 'TMS9918 / V9938 VDP + AY-3-8910 PSG 3 voix',
      resolution: '256x192 pixels (16 couleurs)',
      media: 'Cartouches ROM et Cassettes',
      unitsSold: '~9 millions (Japon + Europe + Brésil)'
    },
    extensions: ['.rom', '.mx1', '.dsk', '.cas', '.zip', '.7z'],
    libretroSystemName: 'Microsoft_-_MSX',
    defaultCoreLinux: 'bluemsx_libretro.so',
    defaultCoreWindows: 'bluemsx_libretro.dll',
    subfolder: 'msx',
    icon: 'Cpu',
    themeColor: '#003d7a',
    logoUrl: './logos/consoles/msx.png',
    biosList: [
      { filename: 'MSX.ROM', description: 'MSX BIOS ROM (Requis)', optional: false },
      { filename: 'DISK.ROM', description: 'MSX Disk ROM (Pour les disquettes)', optional: true }
    ]
  },
  {
    id: 'scummvm',
    name: 'ScummVM (Aventures Graphiques)',
    shortName: 'ScummVM',
    companyId: 'multiple',
    manufacturer: 'Multi-plateformes (Émulateur logiciel)',
    releaseYear: 2001,
    generation: 'Multi-génération (Aventures point-and-click)',
    specs: {
      cpu: 'N/A — Émulateur multi-plateforme software',
      gpuOrAudio: 'Émulation des moteurs : SCUMM, Sierra AGI/SCI, AdLib, Roland MT-32',
      resolution: 'Variable selon le jeu (320x200 VGA à résolutions librement scalées)',
      media: 'Archives de jeux numériques et CD-ROM de collection',
      unitsSold: 'N/A (logiciel open-source)'
    },
    extensions: ['.scummvm', '.zip'],
    libretroSystemName: 'ScummVM',
    defaultCoreLinux: 'scummvm_libretro.so',
    defaultCoreWindows: 'scummvm_libretro.dll',
    subfolder: 'scummvm',
    icon: 'BookOpen',
    themeColor: '#c0392b',
    logoUrl: './logos/consoles/scummvm.png',
    biosList: []
  },
  {
    id: 'appleii',
    name: 'Apple II',
    shortName: 'Apple II',
    companyId: 'apple',
    manufacturer: 'Apple Computer',
    releaseYear: 1977,
    generation: '1re génération (Micro-ordinateur 8-bit)',
    specs: {
      cpu: 'MOS Technology 6502 @ 1 MHz',
      gpuOrAudio: 'Contrôleur graphique intégré (Lo-Res 40x48 / Hi-Res 280x192) + Haut-parleur 1 voix',
      resolution: '280x192 pixels (6 couleurs) ou 40x24 texte',
      media: 'Disquettes 5.25" (140 KB) et Cassettes',
      unitsSold: '~5 à 6 millions (Apple II toutes versions)'
    },
    extensions: ['.dsk', '.po', '.nib', '.zip', '.7z'],
    libretroSystemName: 'Apple_-_II',
    defaultCoreLinux: 'minivmac_libretro.so',
    defaultCoreWindows: 'minivmac_libretro.dll',
    subfolder: 'appleii',
    icon: 'Cpu',
    themeColor: '#a8a8a8',
    logoUrl: './logos/consoles/appleii.png',
    biosList: []
  },
  {
    id: 'msdos',
    name: 'MS-DOS / PC DOS',
    shortName: 'MS-DOS',
    companyId: 'microsoft',
    manufacturer: 'Microsoft / IBM PC Compatible',
    releaseYear: 1981,
    generation: 'Multi-génération (Micro-ordinateur x86)',
    specs: {
      cpu: 'Intel x86 8086/8088 (4.77 MHz) à Pentium 4 (selon l\'époque)',
      gpuOrAudio: 'CGA / EGA / VGA / SVGA + Sound Blaster / AdLib / Roland MT-32',
      resolution: 'De 320x200 (16 couleurs CGA) à 1024x768 SVGA (16.7M couleurs)',
      media: 'Disquettes 5.25" / 3.5" et CD-ROM',
      unitsSold: 'Des centaines de millions de PC compatibles IBM'
    },
    extensions: ['.exe', '.com', '.bat', '.zip'],
    libretroSystemName: 'DOS',
    defaultCoreLinux: 'dosbox_pure_libretro.so',
    defaultCoreWindows: 'dosbox_pure_libretro.dll',
    subfolder: 'msdos',
    icon: 'Terminal',
    themeColor: '#0078d7',
    logoUrl: './logos/consoles/msdos.png',
    biosList: []
  },
  {
    id: 'amstradcpc',
    name: 'Amstrad CPC',
    shortName: 'Amstrad CPC',
    companyId: 'amstrad',
    manufacturer: 'Amstrad',
    releaseYear: 1984,
    generation: '3e génération (Micro-ordinateur 8-bit)',
    specs: {
      cpu: 'Zilog Z80A @ 4 MHz',
      gpuOrAudio: 'CRTC MC6845 (160x200/16c à 640x200/2c) + AY-3-8912 PSG 3 voix',
      resolution: '160x200 (16 couleurs) à 640x200 (2 couleurs)',
      media: 'Cassettes, Disquettes 3" (Amstrad DDI-1) et Cartouches (GX4000)',
      unitsSold: '~3 millions (succès surtout au Royaume-Uni et en France)'
    },
    extensions: ['.dsk', '.cdt', '.sna', '.zip', '.7z'],
    libretroSystemName: 'Amstrad_-_CPC',
    defaultCoreLinux: 'crocods_libretro.so',
    defaultCoreWindows: 'crocods_libretro.dll',
    subfolder: 'amstradcpc',
    icon: 'Cpu',
    themeColor: '#0047ab',
    logoUrl: './logos/consoles/amstradcpc.png',
    biosList: []
  },

  // ─── CONSOLES & MICRO COMPLÉMENTAIRES (ajout 2026) ───
  {
    id: 'zxspectrum',
    name: 'Sinclair ZX Spectrum',
    shortName: 'ZX Spectrum',
    companyId: 'sinclair',
    manufacturer: 'Sinclair Research',
    releaseYear: 1982,
    generation: '2e génération (Micro-ordinateur 8-bit)',
    specs: {
      cpu: 'Zilog Z80A @ 3.5 MHz',
      gpuOrAudio: 'ULA + 256x192 (15 couleurs, attribution par blocs 8x8) + beeper 1 bit',
      resolution: '256x192 pixels',
      media: 'Cassettes audio et Microdrive',
      unitsSold: '5 millions (culte au Royaume-Uni)'
    },
    extensions: ['.tzx', '.tap', '.z80', '.sna', '.zip', '.7z'],
    libretroSystemName: 'Sinclair_-_ZX_Spectrum',
    defaultCoreLinux: 'fuse_libretro.so',
    defaultCoreWindows: 'fuse_libretro.dll',
    subfolder: 'zxspectrum',
    icon: 'Cpu',
    themeColor: '#d31f1f',
    logoUrl: './logos/consoles/zxspectrum.png',
    biosList: []
  },
  {
    id: 'zx81',
    name: 'Sinclair ZX81',
    shortName: 'ZX81',
    companyId: 'sinclair',
    manufacturer: 'Sinclair Research',
    releaseYear: 1981,
    generation: '1re génération (Micro-ordinateur 8-bit)',
    specs: {
      cpu: 'Zilog Z80A @ 3.25 MHz',
      gpuOrAudio: 'Affichage caractères 32x24 (graphiques par blocs), pas de son',
      resolution: '256x192 (caractères + blocs)',
      media: 'Cassettes audio et cartouches 8/16 KB',
      unitsSold: '1.5 million'
    },
    extensions: ['.tzx', '.tap', '.p', '.81', '.zip'],
    libretroSystemName: 'Sinclair_-_ZX_81',
    defaultCoreLinux: '81_libretro.so',
    defaultCoreWindows: '81_libretro.dll',
    subfolder: 'zx81',
    icon: 'Cpu',
    themeColor: '#8a8a8a',
    logoUrl: './logos/consoles/zx81.png',
    biosList: []
  },
  {
    id: 'gameandwatch',
    name: 'Nintendo Game & Watch',
    shortName: 'Game & Watch',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 1980,
    generation: 'Console portable à jeu unique',
    specs: {
      cpu: 'Sharp SM5xx 4-bit',
      gpuOrAudio: 'Écran LCD à segments pré-imprimés + buzzer piézo',
      resolution: 'LCD fixe par jeu',
      media: 'Jeu intégré (43 modèles : Ball, Fire, Donkey Kong...)',
      unitsSold: '43.4 millions'
    },
    extensions: ['.mgw', '.zip'],
    libretroSystemName: 'Nintendo_-_Game_and_Watch',
    defaultCoreLinux: 'gw_libretro.so',
    defaultCoreWindows: 'gw_libretro.dll',
    subfolder: 'gameandwatch',
    icon: 'Smartphone',
    themeColor: '#c9a227',
    logoUrl: './logos/consoles/gameandwatch.png',
    biosList: []
  },
  {
    id: 'pokemonmini',
    name: 'Pokémon Mini',
    shortName: 'PokéMini',
    companyId: 'nintendo',
    manufacturer: 'Nintendo',
    releaseYear: 2001,
    generation: 'Console portable de poche',
    specs: {
      cpu: 'E0C6S46 (Seiko Epson) 8-bit @ 4 MHz',
      gpuOrAudio: 'LCD 96x64 monochrome + buzzer interne',
      resolution: '96x64 pixels',
      media: 'Cartouches miniatures (le plus petit format de cartouche Nintendo)',
      unitsSold: '~1 million (Japon/USA)'
    },
    extensions: ['.min', '.pmx', '.zip'],
    libretroSystemName: 'Nintendo_-_Pokemon_Mini',
    defaultCoreLinux: 'pokemini_libretro.so',
    defaultCoreWindows: 'pokemini_libretro.dll',
    subfolder: 'pokemonmini',
    icon: 'Smartphone',
    themeColor: '#ffcb05',
    logoUrl: './logos/consoles/pokemonmini.png',
    biosList: [
      { filename: 'bios_min_revised.bin', description: 'BIOS Pokémon Mini (recommandé pour compatibilité)', md5: '1e2e30ef4c9a74e01d0ed759bf5f3d54', optional: true }
    ]
  },
  {
    id: 'odyssey2',
    name: 'Magnavox Odyssey² / Videopac',
    shortName: 'Odyssey²',
    companyId: 'magnavox',
    manufacturer: 'Magnavox / Philips',
    releaseYear: 1978,
    generation: '2e génération (8-bit)',
    specs: {
      cpu: 'Intel 8048 @ 1.79 MHz',
      gpuOrAudio: ' contrôleur vidéo/audio intégré 160x200 + buzzer 1 canal',
      resolution: '160x200 pixels',
      media: 'Cartouches ROM (2-4-8 KB)',
      unitsSold: '2 millions'
    },
    extensions: ['.bin', '.o2', '.zip'],
    libretroSystemName: 'Magnavox_-_Odyssey_2',
    defaultCoreLinux: 'o2em_libretro.so',
    defaultCoreWindows: 'o2em_libretro.dll',
    subfolder: 'odyssey2',
    icon: 'Tv',
    themeColor: '#0e5fd8',
    logoUrl: './logos/consoles/odyssey2.png',
    biosList: [
      { filename: 'o2rom.bin', description: 'BIOS Odyssey² (obligatoire)', md5: '562d5ebf9e030a40d6fabfc2f33139fd', optional: false }
    ]
  },
  {
    id: 'pc8801',
    name: 'NEC PC-8801',
    shortName: 'PC-88',
    companyId: 'nec',
    manufacturer: 'NEC',
    releaseYear: 1979,
    generation: 'Micro-ordinateur 8-bit japonais',
    specs: {
      cpu: 'NEC μPD780 (Z80 compatible) @ 4-8 MHz',
      gpuOrAudio: 'μPD3301 + YM2203 (jusqu à 640x400, très haut pour l époque)',
      resolution: '640x200 à 640x400',
      media: 'Cassettes et disquettes 5.25"',
      unitsSold: '~2 millions (Japon uniquement)'
    },
    extensions: ['.d88', '.88d', '.cmt', '.t88', '.zip'],
    libretroSystemName: 'NEC_-_PC-8801',
    defaultCoreLinux: 'quasi88_libretro.so',
    defaultCoreWindows: 'quasi88_libretro.dll',
    subfolder: 'pc8801',
    icon: 'Cpu',
    themeColor: '#4a1fb8',
    logoUrl: './logos/consoles/pc8801.png',
    biosList: [
      { filename: 'n88.rom', description: 'BIOS N88-BASIC v3 (obligatoire)', optional: true }
    ]
  },
  {
    id: 'pc9801',
    name: 'NEC PC-9801',
    shortName: 'PC-98',
    companyId: 'nec',
    manufacturer: 'NEC',
    releaseYear: 1982,
    generation: 'Micro-ordinateur 16-bit japonais',
    specs: {
      cpu: 'Intel 8086 à 80386 (5-16 MHz selon modèles)',
      gpuOrAudio: 'EGC 640x400 16 couleurs + FM YM2608 (26 tons)',
      resolution: '640x400 (standard Japon 30 ans !)',
      media: 'Disquettes 5.25"/3.5" puis CD-ROM',
      unitsSold: '~18 millions (Japon, epoch PC-9821 incluse)'
    },
    extensions: ['.d98', '.hdi', '.thd', '.nhd', '.fdd', '.zip'],
    libretroSystemName: 'NEC_-_PC-9801',
    defaultCoreLinux: 'np2kai_libretro.so',
    defaultCoreWindows: 'np2kai_libretro.dll',
    subfolder: 'pc9801',
    icon: 'Cpu',
    themeColor: '#b81f4a',
    logoUrl: './logos/consoles/pc9801.png',
    biosList: [
      { filename: 'itf.rom', description: 'BIOS PC-98 (itf.rom + bmp.rom + font.rom requis)', optional: true }
    ]
  },
  {
    id: 'amiga1200',
    name: 'Commodore Amiga 1200',
    shortName: 'Amiga 1200',
    companyId: 'commodore',
    manufacturer: 'Commodore',
    releaseYear: 1992,
    generation: '5e génération (Micro-ordinateur 32-bit)',
    specs: {
      cpu: 'Motorola 68EC020 @ 14 MHz',
      gpuOrAudio: 'AGA chipset (262144 couleurs en HAM8) + 4 canaux Paula 8 voices',
      resolution: '320x256 à 1280x512 (AGA)',
      media: 'Disquettes 3.5" DD et disque dur 2.5" IDE intégré',
      unitsSold: '~1.9 millions (AGA + CD32)'
    },
    extensions: ['.adf', '.hdf', '.lha', '.zip', '.7z'],
    libretroSystemName: 'Commodore_-_Amiga',
    defaultCoreLinux: 'puae_libretro.so',
    defaultCoreWindows: 'puae_libretro.dll',
    subfolder: 'amiga1200',
    icon: 'Cpu',
    themeColor: '#cc44ff',
    logoUrl: './logos/consoles/amiga1200.png',
    biosList: [
      { filename: 'kick40068.A1200', description: 'AmigaOS Kickstart v3.1 A1200 (indispensable)', md5: '646773759326200b63caba84e82c9ffe', optional: false }
    ]
  },
  {
    id: 'cdi',
    name: 'Philips CD-i',
    shortName: 'CD-i',
    companyId: 'magnavox',
    manufacturer: 'Philips',
    releaseYear: 1991,
    generation: '5e génération (multimédia CD)',
    specs: {
      cpu: 'Motorola 68070 @ 15.5 MHz',
      gpuOrAudio: 'VSDA vidéo CD + MCD audio, résolution jusqu à 768x560',
      resolution: '384x280 à 768x560',
      media: 'CD-ROM (jeux, encyclopédies, lecteurs vidéo)',
      unitsSold: '~1 million (échec commercial historique)'
    },
    extensions: ['.chd', '.cue', '.bin', '.zip'],
    libretroSystemName: 'Philips_-_CD-i',
    defaultCoreLinux: 'same_cdi_libretro.so',
    defaultCoreWindows: 'same_cdi_libretro.dll',
    subfolder: 'cdi',
    icon: 'Disc3',
    themeColor: '#3a3a5c',
    logoUrl: './logos/consoles/cdi.png',
    biosList: [
      { filename: 'zx32950b.bin', description: 'BIOS CD-i 220/450 (flash IC1)', md5: '3262a3f1c1c6f2e2ac1d3d3f3f3f3f3f', optional: false }
    ]
  },
  {
    id: 'fmtowns',
    name: 'Fujitsu FM Towns',
    shortName: 'FM Towns',
    companyId: 'multiple',
    manufacturer: 'Fujitsu',
    releaseYear: 1989,
    generation: 'Micro-ordinateur 32-bit japonais multimédia',
    specs: {
      cpu: 'Intel 80386DX @ 16 MHz',
      gpuOrAudio: 'Vram 640x535 32768 couleurs + CD-ROM intégré + Yamaha YM2612',
      resolution: '640x400 (jusqu à 1024x768)',
      media: 'CD-ROM (avec disquette de boot)',
      unitsSold: 'culte au Japon (jeux FMV et ports arcade parfaits)'
    },
    extensions: ['.cue', '.bin', '.chd', '.iso', '.zip'],
    libretroSystemName: 'Fujitsu_-_FM_Towns',
    defaultCoreLinux: 'mame_libretro.so',
    defaultCoreWindows: 'mame_libretro.dll',
    subfolder: 'fmtowns',
    icon: 'Disc3',
    themeColor: '#7d7d7d',
    logoUrl: './logos/consoles/fmtowns.png',
    biosList: []
  },
  {
    id: 'bbcmicro',
    name: 'Acorn BBC Micro',
    shortName: 'BBC Micro',
    companyId: 'multiple',
    manufacturer: 'Acorn Computers',
    releaseYear: 1981,
    generation: 'Micro-ordinateur 8-bit britannique',
    specs: {
      cpu: 'MOS 6502A @ 2 MHz',
      gpuOrAudio: 'MC6845 + Texas SN76489 (640x256, 8 couleurs)',
      resolution: '640x256 pixels',
      media: 'Cassettes et disquettes',
      unitsSold: '~1.5 million (écoles britanniques)'
    },
    extensions: ['.ssd', '.dsd', '.adf', '.uef', '.zip'],
    libretroSystemName: 'Acorn_-_BBC_Micro',
    defaultCoreLinux: 'b2_libretro.so',
    defaultCoreWindows: 'b2_libretro.dll',
    subfolder: 'bbcmicro',
    icon: 'Cpu',
    themeColor: '#c4c4c4',
    logoUrl: './logos/consoles/bbcmicro.png',
    biosList: []
  },
  {
    id: 'cps1',
    name: 'Capcom Play System 1 (Arcade)',
    shortName: 'CPS-1',
    companyId: 'capcom',
    manufacturer: 'Capcom',
    releaseYear: 1988,
    generation: 'Carte d arcade',
    specs: {
      cpu: 'Motorola 68000 @ 10 MHz + Z80 (son)',
      gpuOrAudio: '16.7M palette, 1024 sprites + QSound (1993)',
      resolution: '384x224 pixels',
      media: 'Cartouches arcade B-board / C-board',
      unitsSold: 'Street Fighter II, Final Fight, 1942, Ghouls n Ghosts'
    },
    extensions: ['.zip', '.7z'],
    libretroSystemName: 'Capcom_-_CPS-1',
    defaultCoreLinux: 'fbneo_libretro.so',
    defaultCoreWindows: 'fbneo_libretro.dll',
    subfolder: 'cps1',
    icon: 'Gamepad2',
    themeColor: '#2244cc',
    logoUrl: './logos/consoles/cps1.png',
    biosList: []
  },
  {
    id: 'cps2',
    name: 'Capcom Play System 2 (Arcade)',
    shortName: 'CPS-2',
    companyId: 'capcom',
    manufacturer: 'Capcom',
    releaseYear: 1993,
    generation: 'Carte d arcade',
    specs: {
      cpu: 'Motorola 68EC020 @ 16 MHz + Z80',
      gpuOrAudio: 'QSound DSP 16 canaux, sprites illimités en pratique',
      resolution: '384x224 pixels',
      media: 'Cartouches arcade avec suicide battery (encryption !)',
      unitsSold: 'Street Fighter Alpha, Marvel Super Heroes, X-Men vs SF'
    },
    extensions: ['.zip', '.7z'],
    libretroSystemName: 'Capcom_-_CPS-2',
    defaultCoreLinux: 'fbneo_libretro.so',
    defaultCoreWindows: 'fbneo_libretro.dll',
    subfolder: 'cps2',
    icon: 'Gamepad2',
    themeColor: '#1a33a0',
    logoUrl: './logos/consoles/cps2.png',
    biosList: []
  },
  {
    id: 'cps3',
    name: 'Capcom Play System 3 (Arcade)',
    shortName: 'CPS-3',
    companyId: 'capcom',
    manufacturer: 'Capcom',
    releaseYear: 1996,
    generation: 'Carte d arcade',
    specs: {
      cpu: 'Hitachi SH-2 x3 @ 28.6 MHz',
      gpuOrAudio: 'Sprites vectoriels ultra-fluides + QSound',
      resolution: '384x224 pixels',
      media: 'CD-ROM + cartouche de caractères (6 jeux seulement, dont SFIII)',
      unitsSold: 'Street Fighter III, JoJo, Red Earth'
    },
    extensions: ['.zip', '.7z', '.chd'],
    libretroSystemName: 'Capcom_-_CPS-3',
    defaultCoreLinux: 'fbneo_libretro.so',
    defaultCoreWindows: 'fbneo_libretro.dll',
    subfolder: 'cps3',
    icon: 'Gamepad2',
    themeColor: '#0f2280',
    logoUrl: './logos/consoles/cps3.png',
    biosList: [
      { filename: 'cps3_boot.bin', description: 'BIOS CPS-3 (requis, inclus dans les sets FBNeo)', optional: true }
    ]
  },
  {
    id: 'x68000',
    name: 'Sharp X68000',
    shortName: 'X68000',
    companyId: 'multiple',
    manufacturer: 'Sharp',
    releaseYear: 1987,
    generation: 'Micro-ordinateur 16/32-bit japonais',
    specs: {
      cpu: 'Motorola 68000 @ 10 MHz',
      gpuOrAudio: 'Custom Sharp (640x512, 65 536 couleurs) + Oki MSM6258 + YM2151',
      resolution: '640x512 pixels',
      media: 'Disquettes 5.25" (la tour iconique)',
      unitsSold: 'culte au Japon (ports arcade parfaits)'
    },
    extensions: ['.dim', '.img', '.d88', '.hdf', '.zip'],
    libretroSystemName: 'Sharp_-_X68000',
    defaultCoreLinux: 'px68k_libretro.so',
    defaultCoreWindows: 'px68k_libretro.dll',
    subfolder: 'x68000',
    icon: 'Cpu',
    themeColor: '#2a2a35',
    logoUrl: './logos/consoles/x68000.png',
    biosList: [
      { filename: 'iplrom.dat', description: 'IPLROM X68000 (obligatoire pour PX68K)', optional: false },
      { filename: 'cgrom.dat', description: 'CGROM polices X68000 (obligatoire)', optional: false }
    ]
  },
  {
    id: 'x1',
    name: 'Sharp X1',
    shortName: 'X1',
    companyId: 'multiple',
    manufacturer: 'Sharp',
    releaseYear: 1982,
    generation: 'Micro-ordinateur 8-bit japonais',
    specs: {
      cpu: 'Zilog Z80 @ 4 MHz',
      gpuOrAudio: 'CRTC Sharp (640x400) + AY-3-8910 PSG 3 voix',
      resolution: '640x200 à 640x400',
      media: 'Cassettes et disquettes 5.25"',
      unitsSold: 'culte au Japon (ports Taito)'
    },
    extensions: ['.d88', '.t88', '.zip'],
    libretroSystemName: 'Sharp_-_X1',
    defaultCoreLinux: 'x1_libretro.so',
    defaultCoreWindows: 'x1_libretro.dll',
    subfolder: 'x1',
    icon: 'Cpu',
    themeColor: '#c0392b',
    logoUrl: './logos/consoles/x1.png',
    biosList: [
      { filename: 'IPLROM.X1', description: 'IPLROM Sharp X1 (recommandé)', optional: true }
    ]
  },
  {
    id: 'atari8bit',
    name: 'Atari 8-bit Family',
    shortName: 'Atari 8-bit',
    companyId: 'atari',
    manufacturer: 'Atari',
    releaseYear: 1979,
    generation: 'Micro-ordinateur 8-bit pionnier',
    specs: {
      cpu: 'MOS 6502C @ 1.79 MHz (ANTIC + GTIA + POKEY intégrés)',
      gpuOrAudio: 'ANTIC/GTIA (256 couleurs) + POKEY 4 voix (la puce est un son !)',
      resolution: '320x192 à 640x400',
      media: 'Cassettes, disquettes 5.25" et cartouches ROM',
      unitsSold: '~4 millions (800/800XL/130XE...)'
    },
    extensions: ['.atr', '.xfd', '.dsk', '.atr.gz', '.zip'],
    libretroSystemName: 'Atari_-_8-bit_Family',
    defaultCoreLinux: 'atari800_libretro.so',
    defaultCoreWindows: 'atari800_libretro.dll',
    subfolder: 'atari8bit',
    icon: 'Cpu',
    themeColor: '#c94f2b',
    logoUrl: './logos/consoles/atari8bit.png',
    biosList: [
      { filename: 'ATARIXL.ROM', description: 'OS XL (obligatoire pour XL/XE)', optional: true },
      { filename: 'ATARIOSA.ROM', description: 'OS 400/800 révision A', optional: true }
    ]
  },
  {
    id: 'vic20',
    name: 'Commodore VIC-20',
    shortName: 'VIC-20',
    companyId: 'commodore',
    manufacturer: 'Commodore',
    releaseYear: 1980,
    generation: 'Micro-ordinateur 8-bit pionnier',
    specs: {
      cpu: 'MOS 6502 @ 1.02 MHz',
      gpuOrAudio: 'VIC (176x184, 16 couleurs) + VIA + juste le biper 4 voix logiciel',
      resolution: '176x184 pixels',
      media: 'Cassettes et cartouches ROM (5 KB RAM d usine !)',
      unitsSold: '1 million (le 1er à dépasser le million !)'
    },
    extensions: ['.d64', '.t64', '.prg', '.tap', '.zip'],
    libretroSystemName: 'Commodore_-_VIC-20',
    defaultCoreLinux: 'vice_xvic_libretro.so',
    defaultCoreWindows: 'vice_xvic_libretro.dll',
    subfolder: 'vic20',
    icon: 'Cpu',
    themeColor: '#e8e8e8',
    logoUrl: './logos/consoles/vic20.png',
    biosList: []
  },
  {
    id: 'c128',
    name: 'Commodore 128',
    shortName: 'C128',
    companyId: 'commodore',
    manufacturer: 'Commodore',
    releaseYear: 1985,
    generation: 'Micro-ordinateur 8-bit (double CPU)',
    specs: {
      cpu: 'MOS 8502 @ 1-2 MHz + Zilog Z80 @ 4 MHz (CP/M !)',
      gpuOrAudio: 'VDC 80 colonnes + VIC-II (compatible C64)',
      resolution: '640x200 (VDC 80 col) + 320x200 VIC-II',
      media: 'Cassettes, disquettes 1571 et cartouches',
      unitsSold: '4 millions (dernier 8-bit Commodore)'
    },
    extensions: ['.d64', '.d71', '.t64', '.prg', '.zip'],
    libretroSystemName: 'Commodore_-_128',
    defaultCoreLinux: 'vice_x128_libretro.so',
    defaultCoreWindows: 'vice_x128_libretro.dll',
    subfolder: 'c128',
    icon: 'Cpu',
    themeColor: '#b8a88a',
    logoUrl: './logos/consoles/c128.png',
    biosList: []
  },
  {
    id: 'plus4',
    name: 'Commodore Plus/4',
    shortName: 'Plus/4',
    companyId: 'commodore',
    manufacturer: 'Commodore',
    releaseYear: 1984,
    generation: 'Micro-ordinateur 8-bit bureautique',
    specs: {
      cpu: 'MOS 7501 (6502 compatible) @ 1.76 MHz',
      gpuOrAudio: 'TED (121 couleurs, la palette la plus riche 8-bit !) + 2 voix',
      resolution: '320x200 à 640x200',
      media: 'Cassettes et cartouches (4 logiciels bureautiques intégrés)',
      unitsSold: '~1 million (surtout en Europe de l Est)'
    },
    extensions: ['.d64', '.t64', '.prg', '.tap', '.zip'],
    libretroSystemName: 'Commodore_-_Plus4',
    defaultCoreLinux: 'vice_xplus4_libretro.so',
    defaultCoreWindows: 'vice_xplus4_libretro.dll',
    subfolder: 'plus4',
    icon: 'Cpu',
    themeColor: '#8f8f8f',
    logoUrl: './logos/consoles/plus4.png',
    biosList: []
  },
  {
    id: 'thomson',
    name: 'Thomson MO/TO',
    shortName: 'Thomson',
    companyId: 'multiple',
    manufacturer: 'Thomson',
    releaseYear: 1984,
    generation: 'Micro-ordinateur 8-bit français',
    specs: {
      cpu: 'Motorola 6803 (MO5) / 6809 (TO7-70, MO6) @ 1-2 MHz',
      gpuOrAudio: 'EF9369 (MO5 : 320x200, 16 couleurs parmi 4096 !) + SN76489',
      resolution: '320x200 pixels',
      media: 'Cassettes et disquettes 3.5" (le « plan informatique pour tous » français)',
      unitsSold: 'des millions en France (écoles + foyers via le plan IPT)'
    },
    extensions: ['.fd', '.sap', '.k7', '.m5', '.m7', '.zip'],
    libretroSystemName: 'Thomson_-_MO5',
    defaultCoreLinux: 'theodore_libretro.so',
    defaultCoreWindows: 'theodore_libretro.dll',
    subfolder: 'thomson',
    icon: 'Cpu',
    themeColor: '#2e7d32',
    logoUrl: './logos/consoles/thomson.png',
    biosList: [
      { filename: 'MO5.ROM', description: 'BIOS Thomson MO5 (obligatoire)', optional: true }
    ]
  },
  {
    id: 'neogeocd',
    name: 'SNK Neo Geo CD',
    shortName: 'Neo Geo CD',
    companyId: 'snk',
    manufacturer: 'SNK',
    releaseYear: 1994,
    generation: '5e génération (CD)',
    specs: {
      cpu: 'Motorola 68000 @ 12 MHz + Z80 (identique à la Neo Geo cartouche)',
      gpuOrAudio: 'Même chipset arcade : 4096 couleurs, 380 sprites + PCM 7 canaux',
      resolution: '320x224 pixels',
      media: 'CD-ROM (les jeux arcade à prix CD !)',
      unitsSold: '~1 million (chargements longs...)'
    },
    extensions: ['.chd', '.cue', '.bin', '.iso', '.zip'],
    libretroSystemName: 'SNK_-_Neo_Geo_CD',
    defaultCoreLinux: 'neocd_libretro.so',
    defaultCoreWindows: 'neocd_libretro.dll',
    subfolder: 'neogeocd',
    icon: 'Disc3',
    themeColor: '#f5c518',
    logoUrl: './logos/consoles/neogeocd.png',
    biosList: [
      { filename: 'neocd.bin', description: 'BIOS Neo Geo CD (top-loading ou front-loading)', md5: 'f39572af7584cb5b3f2ae2665ebef6d5', optional: false }
    ]
  },
  {
    id: 'pc8000',
    name: 'NEC PC-8001',
    shortName: 'PC-8001',
    companyId: 'nec',
    manufacturer: 'NEC',
    releaseYear: 1979,
    generation: 'Micro-ordinateur 8-bit japonais pionnier',
    specs: {
      cpu: 'NEC μPD780 (Z80 compatible) @ 4 MHz',
      gpuOrAudio: 'μPD3301 (640x200) + buzzer puis AY-3-8910',
      resolution: '640x200 pixels',
      media: 'Cassettes et disquettes 5.25"',
      unitsSold: 'le premier succès NEC (base du PC-88)'
    },
    extensions: ['.d88', '.t88', '.cmt', '.zip'],
    libretroSystemName: 'NEC_-_PC-8000_Series',
    defaultCoreLinux: 'yaba sanshiro2_libretro.so',
    defaultCoreWindows: 'quasi88_libretro.dll',
    subfolder: 'pc8000',
    icon: 'Cpu',
    themeColor: '#5c3d8f',
    logoUrl: './logos/consoles/pc8000.png',
    biosList: [
      { filename: 'n80.rom', description: 'BIOS N80-BASIC (recommandé)', optional: true }
    ]
  },
  {
    id: 'gx4000',
    name: 'Amstrad GX4000',
    shortName: 'GX4000',
    companyId: 'amstrad',
    manufacturer: 'Amstrad',
    releaseYear: 1990,
    generation: '4e génération (8-bit cartouche)',
    specs: {
      cpu: 'Zilog Z80A @ 4 MHz (le cœur de l Amstrad CPC plus)',
      gpuOrAudio: 'CRTC ASIC (6128 plus) : 4096 couleurs, sprites hardware + DMA audio',
      resolution: '320x200 à 640x200',
      media: 'Cartouches ROM (+ ports CPC pour clavier)',
      unitsSold: 'échec (~15 000 en Europe, tuée par la Mega Drive/SM)'
    },
    extensions: ['.cpt', '.dsk', '.zip'],
    libretroSystemName: 'Amstrad_-_GX4000',
    defaultCoreLinux: 'cap32_libretro.so',
    defaultCoreWindows: 'cap32_libretro.dll',
    subfolder: 'gx4000',
    icon: 'Gamepad2',
    themeColor: '#5c2d91',
    logoUrl: './logos/consoles/gx4000.png',
    biosList: []
  }
];

export const SYSTEMS: System[] = RAW_SYSTEMS.map((sys) => ({
  ...sys,
  museum: MUSEUM_DATA[sys.id] || undefined,
}));
