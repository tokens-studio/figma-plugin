import defaultJSON from '@/config/default.json';
import tailwindJSON from '@/config/tailwind.json';
import designTokenStarter from '@/config/designtokensstarter.json';
import { SetTokenDataPayload } from '@/types/payloads';
import { DeepTokensMap } from '@/types';

export type Preset = {
  id: string;
  text: string;
  description: string;
  author: string;
  type: string;
  json: DeepTokensMap;
};

export const presets: Preset[] = [
  {
    id: 'default',
    text: 'Default Preset',
    description: 'A wide variety of tokens and some token sets to give you an idea of what you can do.',
    author: 'Jan Six',
    type: 'default',
    json: defaultJSON,
  },
  {
    id: 'tailwind',
    text: 'Tailwind Preset',
    description: 'A set of tokens that match the Tailwind CSS framework.',
    author: 'Sam Gordashko',
    type: 'tailwind',
    json: tailwindJSON,
  },
  {
    id: 'design-token-starter',
    text: 'Design Token Starter Preset',
    description: 'A set of tokens that match the Design Token Starter.',
    author: 'Philipp Jeroma',
    type: 'design-token-starter',
    json: designTokenStarter,
  },
];
