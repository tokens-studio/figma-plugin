import { StorageProviderType } from '@/constants/StorageProviderType';
import { StorageType, StorageTypeCredentials, StorageTypeFormValues } from '@/types/StorageType';
import { normalizeGiteaUrl } from '@/storage/gitea';
import { generateId } from './generateId';

type CredentialConfiguration = StorageType | StorageTypeFormValues<false>;
type CredentialScope = (configuration: CredentialConfiguration) => string;

// A saved identifier alone cannot authorize reusing a secret outside the trusted
// service that issued it. Register each provider's additional scope here.
const credentialScopes: Partial<Record<StorageProviderType, CredentialScope>> = {
  [StorageProviderType.GITEA]: (configuration) => normalizeGiteaUrl(
    'baseUrl' in configuration ? configuration.baseUrl ?? '' : '',
  ),
};

export function hasSameCredentialScope(
  credential: StorageTypeCredentials,
  configuration: CredentialConfiguration,
): boolean {
  const credentialScope = credentialScopes[credential.provider];
  const configurationScope = credentialScopes[configuration.provider];
  if (!credentialScope && !configurationScope) return true;
  if (credential.provider !== configuration.provider || !credentialScope || !configurationScope) return false;
  try {
    return credentialScope(credential) === configurationScope(configuration);
  } catch {
    return false;
  }
}

export function matchesCredentialById(
  credential: StorageTypeCredentials,
  configuration: CredentialConfiguration,
): boolean {
  const requiresScope = !!credentialScopes[credential.provider] || !!credentialScopes[configuration.provider];
  return configuration.provider !== StorageProviderType.LOCAL
    && (!requiresScope || (!!credential.internalId && !!configuration.internalId))
    && credential.internalId === configuration.internalId
    && hasSameCredentialScope(credential, configuration);
}

// Prepare before hooks persist credentials or shared configuration so both sides
// receive the same identifier when a configuration moves to another service.
export function prepareCredentialIdentity<T extends StorageTypeFormValues<false>>(
  context: T,
  storedCredentials: readonly StorageTypeCredentials[],
): T {
  if (context.provider === StorageProviderType.LOCAL || !context.internalId) return context;
  const conflictingIdentity = storedCredentials.some((credential) => (
    credential.internalId === context.internalId && !hasSameCredentialScope(credential, context)
  ));
  return conflictingIdentity ? { ...context, internalId: generateId(24) } : context;
}
