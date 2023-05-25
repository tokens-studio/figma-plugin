import { ThemeObject } from './ThemeObject';
import { SingleToken } from './tokens';
import { UsedTokenSetsMap } from './UsedTokenSetsMap';

export type TokenSets = Record<string, SingleToken[]>;

export enum Clients {
  PLUGIN = 'plugin',
  SECOND_SCREEN = 'second-screen',
}

export interface TokenData {
  id: string | number | null;
  owner_email?: string;
  created_at?: string;
  synced_data: {
    sets: TokenSets | null;
    themes: ThemeObject[];
    usedTokenSets: UsedTokenSetsMap;
    activeTheme: Record<string, string>;
  };
  last_updated_by: Clients;
}
