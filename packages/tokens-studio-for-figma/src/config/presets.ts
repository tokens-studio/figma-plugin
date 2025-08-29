export interface PresetConfig {
  id: string;
  name: string;
  description: string;
  fileName: string;
}

export const AVAILABLE_PRESETS: PresetConfig[] = [
  {
    id: 'default',
    name: 'Complete Design System',
    description: 'A comprehensive set of tokens including colors, typography, spacing, and components. Great for getting started.',
    fileName: 'default.json',
  },
  {
    id: 'minimal',
    name: 'Minimal Starter',
    description: 'A simple, clean set of basic tokens. Perfect for small projects or when you want to build up gradually.',
    fileName: 'minimal.json',
  },
  {
    id: 'material',
    name: 'Material Design',
    description: 'Tokens inspired by Google\'s Material Design principles with elevation, surfaces, and semantic colors.',
    fileName: 'material.json',
  },
  {
    id: 'modern',
    name: 'Modern UI System',
    description: 'A contemporary design system with utility-first approach, semantic colors, and flexible spacing scale.',
    fileName: 'modern.json',
  },
];