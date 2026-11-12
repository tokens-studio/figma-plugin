import { t } from 'i18next';
// The main Figma sandbox has no browser URL global.
import URL from 'core-js-pure/features/url';

export function normalizeGiteaUrl(input: string): string {
  const url = new URL(input.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error(
      t('storage:giteaInvalidUrl', {
        defaultValue: 'Enter an HTTPS Gitea installation URL without credentials, query or fragment.',
      }),
    );
  }
  // Setup accepts the installation URL, not an API endpoint.
  if (/\/api\/v1\/*$/.test(url.pathname)) {
    throw new Error(
      t('storage:giteaInstallationUrl', { defaultValue: 'Enter the Gitea installation URL without /api/v1.' }),
    );
  }
  return url.toString().replace(/\/+$/, '');
}

export const encodeGiteaPath = (path: string) => path.split('/').map(encodeURIComponent).join('/');

export function getGiteaCompareUrl(
  baseUrl: string,
  owner: string,
  repo: string,
  baseBranch: string,
  branch?: string,
): string {
  return `${normalizeGiteaUrl(baseUrl)}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/compare/${
    branch === undefined
      ? encodeURIComponent(baseBranch)
      : `${encodeURIComponent(baseBranch)}...${encodeURIComponent(branch)}`
  }`;
}

export type GiteaErrorCode =
  | 'authentication'
  | 'permission'
  | 'not-found'
  | 'conflict'
  | 'rate-limit'
  | 'server'
  | 'transport'
  | 'malformed'
  | 'uncertain';

const messages: Record<GiteaErrorCode, [string, string]> = {
  authentication: ['giteaAuthenticationError', 'Gitea authentication failed. Check your personal access token.'],
  permission: ['giteaPermissionError', 'Gitea denied access. Check repository permissions and branch protection.'],
  'not-found': [
    'giteaNotFoundError',
    'Gitea repository, branch or path was not found. Check the configuration and token access.',
  ],
  conflict: [
    'giteaConflict',
    'Gitea has changed or rejected the changes. Pull the remote tokens before pushing again.',
  ],
  'rate-limit': ['giteaRateLimitError', 'Gitea rate limit reached. Try again later.'],
  server: ['giteaServerError', 'Gitea returned a server error. Try again later.'],
  transport: [
    'giteaTransportError',
    'Cannot connect to Gitea. Check the server URL, network/VPN and TLS certificate. Self-hosted Gitea must allow cross-origin API requests from Figma; ask your administrator to check CORS settings.',
  ],
  malformed: [
    'giteaMalformedResponse',
    'Gitea returned invalid or unsupported content. Check the token path and server configuration.',
  ],
  uncertain: [
    'giteaUncertainWrite',
    'The Gitea write may have completed. Keep your local edits and pull to reconcile the remote state before pushing again.',
  ],
};

export class GiteaError extends Error {
  constructor(
    public readonly code: GiteaErrorCode,
    public readonly status?: number,
  ) {
    const [key, defaultValue] = messages[code];
    super(t(`storage:${key}`, { defaultValue }));
    this.name = 'GiteaError';
  }
}
