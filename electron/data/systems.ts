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
  }
];

export const SYSTEMS: System[] = RAW_SYSTEMS.map((sys) => ({
  ...sys,
  museum: MUSEUM_DATA[sys.id] || undefined,
}));
