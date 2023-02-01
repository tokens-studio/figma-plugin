import { ThemeObject } from './ThemeObject';
import { SingleToken } from './tokens';
import { UsedTokenSetsMap } from './UsedTokenSetsMap';

export type Token = SingleToken;

export type TokenSets = Record<string, Token[]>;

export enum Clients {
  PLUGIN = 'plugin',
  SECOND_SCREEN = 'second-screen',
}

export interface TokenData {
  id: string | number | null;
  owner_email?: string;
  created_at?: string;
  ftData: {
    sets: TokenSets | null;
    themes: ThemeObject[];
    usedTokenSets: UsedTokenSetsMap;
    activeTheme: string | undefined;
  };
  last_updated_by: Clients;
}
