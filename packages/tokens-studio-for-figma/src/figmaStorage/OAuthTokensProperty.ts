import { OAuthTokens } from '@/types/oauth';
import { tryParseJson } from '@/utils/tryParseJson';
import { FigmaStorageProperty, FigmaStorageType } from './FigmaStorageProperty';

export const OAuthTokensProperty = new FigmaStorageProperty<OAuthTokens | null>(
    FigmaStorageType.CLIENT_STORAGE,
    'oauthTokens',
    (incoming) => JSON.stringify(incoming),
    (outgoing) => tryParseJson<OAuthTokens>(outgoing),
);
