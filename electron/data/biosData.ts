import { BiosRequirement } from '../types';

export interface BiosDefinition extends BiosRequirement {
  systemId: string;
  systemName: string;
}

export const ALL_BIOS_DEFINITIONS: BiosDefinition[] = [
  // Sony PlayStation
  {
    systemId: 'psx',
    systemName: 'Sony PlayStation',
    filename: 'scph5501.bin',
    description: 'PlayStation NTSC-U BIOS SCPH-5501 (USA - Recommandé)',
    md5: '924e392ed05545d11874dcb3cbde8502',
    size: 524288,
    optional: false
  },
  {
    systemId: 'psx',
    systemName: 'Sony PlayStation',
    filename: 'scph5502.bin',
    description: 'PlayStation PAL BIOS SCPH-5502 (Europe)',
    md5: '32736f17079d0b2b7024407779bd3050',
    size: 524288,
    optional: true
  },
  {
    systemId: 'psx',
    systemName: 'Sony PlayStation',
    filename: 'scph5500.bin',
    description: 'PlayStation NTSC-J BIOS SCPH-5500 (Japon)',
    md5: 'ff3eeb8c664e05dce6d36935d86d3bed',
    size: 524288,
    optional: true
  },

  // Sony PlayStation 2
  {
    systemId: 'ps2',
    systemName: 'Sony PlayStation 2',
    filename: 'scph39001.bin',
    description: 'PlayStation 2 NTSC-U BIOS v01.60 SCPH-39001',
    md5: 'd5ce2c7d1108ab9e5c4e97677d2ef1df',
    size: 4194304,
    optional: false
  },
  {
    systemId: 'ps2',
    systemName: 'Sony PlayStation 2',
    filename: 'scph39004.bin',
    description: 'PlayStation 2 PAL BIOS v01.60 SCPH-39004 (Europe)',
    md5: '0c72199b508f657a79f06bf35e807357',
    size: 4194304,
    optional: true
  },

  // Sega Saturn
  {
    systemId: 'saturn',
    systemName: 'Sega Saturn',
    filename: 'saturn_bios.bin',
    description: 'Sega Saturn World/US/EU BIOS v1.01a',
    md5: 'af5832142838c5d29222e4a2f1d88b96',
    size: 524288,
    optional: false
  },
  {
    systemId: 'saturn',
    systemName: 'Sega Saturn',
    filename: 'sega_101.bin',
    description: 'Sega Saturn Japan BIOS v1.01',
    md5: '85ec9ca47d8f6807718151cbcca8b964',
    size: 524288,
    optional: true
  },

  // Sega Dreamcast
  {
    systemId: 'dreamcast',
    systemName: 'Sega Dreamcast',
    filename: 'dc_boot.bin',
    description: 'Dreamcast Boot ROM (v1.01d)',
    md5: 'e10c53c2f8b90bab96ead2d368858623',
    size: 2097152,
    optional: false
  },
  {
    systemId: 'dreamcast',
    systemName: 'Sega Dreamcast',
    filename: 'dc_flash.bin',
    description: 'Dreamcast Flash NVRAM (Horloge & Paramètres)',
    md5: '74e3f69c2bb92bc1e4d96fbab342e472',
    size: 131072,
    optional: false
  },

  // Nintendo GBA
  {
    systemId: 'gba',
    systemName: 'Game Boy Advance',
    filename: 'gba_bios.bin',
    description: 'Game Boy Advance Official Boot BIOS',
    md5: 'a860e8c0b6d573d191e4ec7db1b1e4f6',
    size: 16384,
    optional: true
  },

  // SNK Neo-Geo
  {
    systemId: 'neogeo',
    systemName: 'SNK Neo-Geo',
    filename: 'neogeo.zip',
    description: 'Neo-Geo MVS / AES / UniBIOS Archive (Requis pour FBNeo)',
    optional: false
  },

  // NEC PC-Engine CD
  {
    systemId: 'pcengine',
    systemName: 'PC Engine / TurboGrafx-16',
    filename: 'syscard3.pce',
    description: 'Super CD-ROM² System Card v3.00 (Pour CD-ROM games)',
    md5: '3817d3243ac68a17234394364f9c2937',
    size: 262144,
    optional: true
  },

  // Famicom Disk System
  {
    systemId: 'nes',
    systemName: 'Nintendo Entertainment System',
    filename: 'disksys.rom',
    description: 'Famicom Disk System BIOS (Pour jeux disquettes .fds)',
    md5: 'ca30b50f880eb660a32069da365b69ad',
    size: 8192,
    optional: true
  }
];
