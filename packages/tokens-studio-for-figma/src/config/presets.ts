import { ThemeObject } from '@/types/ThemeObject';
import { TokenSetStatus } from '@/constants/TokenSetStatus';

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  fileName: string;
  themes: ThemeObject[];
}

export const AVAILABLE_PRESETS: PresetConfig[] = [
  {
    id: 'default',
    name: 'Complete Design System',
    description: 'A comprehensive set of tokens including colors, typography, spacing, and components. Great for getting started.',
    fileName: 'default.json',
    themes: [
      {
        id: 'default-light',
        name: 'Light Theme',
        selectedTokenSets: {
          core: TokenSetStatus.SOURCE,
          light: TokenSetStatus.ENABLED,
          theme: TokenSetStatus.ENABLED,
        },
      },
      {
        id: 'default-dark',
        name: 'Dark Theme',
        selectedTokenSets: {
          core: TokenSetStatus.SOURCE,
          dark: TokenSetStatus.ENABLED,
          theme: TokenSetStatus.ENABLED,
        },
      },
    ],
  },
  {
    id: 'minimal',
    name: 'Minimal Starter',
    description: 'A simple, clean set of basic tokens. Perfect for small projects or when you want to build up gradually.',
    fileName: 'minimal.json',
    themes: [
      {
        id: 'minimal-default',
        name: 'Default',
        selectedTokenSets: {
          core: TokenSetStatus.ENABLED,
        },
      },
    ],
  },
  {
    id: 'material',
    name: 'Material Design',
    description: 'Tokens inspired by Google\'s Material Design principles with elevation, surfaces, and semantic colors.',
    fileName: 'material.json',
    themes: [
      {
        id: 'material-light',
        name: 'Light Theme',
        selectedTokenSets: {
          core: TokenSetStatus.SOURCE,
          light: TokenSetStatus.ENABLED,
        },
      },
    ],
  },
  {
    id: 'modern',
    name: 'Modern UI System',
    description: 'A contemporary design system with utility-first approach, semantic colors, and flexible spacing scale.',
    fileName: 'modern.json',
    themes: [
      {
        id: 'modern-light',
        name: 'Light Theme',
        selectedTokenSets: {
          core: TokenSetStatus.SOURCE,
          light: TokenSetStatus.ENABLED,
        },
      },
      {
        id: 'modern-dark',
        name: 'Dark Theme',
        selectedTokenSets: {
          core: TokenSetStatus.SOURCE,
          dark: TokenSetStatus.ENABLED,
        },
      },
    ],
  },
];
