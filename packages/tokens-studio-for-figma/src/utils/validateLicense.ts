import { Entitlements } from '@/app/store/models/userState';
import { LegacyOnlyLicense, fetchLicenseApi, getLegacyOnlyLicense } from './licenseApi';

type ValidateLicenseResponse = { plan?: string; entitlements?: Entitlements[]; email?: string };

export default async function validateLicense(
  licenseKey: string,
  userId: string | null,
  userName?: string | null,
): Promise<{
    plan?: string;
    entitlements?: Entitlements[];
    email?: string;
    error?: string;
    legacyOnly?: LegacyOnlyLicense;
  }> {
  const result = await fetchLicenseApi<ValidateLicenseResponse>(
    `/validate-license?licenseKey=${licenseKey}&userId=${userId}${userName ? `&userName=${userName}` : ''}`,
    {
      endpoint: 'validate-license',
      figmaId: userId,
      // MIGRATION: a partially imported record can answer 200 with no plan and
      // no entitlements, which addLicenseKey would accept as a valid response
      // and quietly drop the user to free. Treat it as a miss and let the
      // legacy host answer instead. Remove with the legacy host.
      isComplete: (data) => Boolean(data?.plan) || (data?.entitlements?.length ?? 0) > 0,
    },
  );

  if (result.ok) {
    const legacyOnly = getLegacyOnlyLicense(result.attempts);
    return legacyOnly ? { ...result.data, legacyOnly } : result.data;
  }

  return { error: result.message ?? 'Error validating license' };
}
