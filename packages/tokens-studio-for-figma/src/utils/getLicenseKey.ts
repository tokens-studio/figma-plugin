import { fetchLicenseApi } from './licenseApi';

type GetLicenseKeyResponse =
  { key: string; }
  | { error: string; };

export default async function getLicenseKey(userId: string | null): Promise<GetLicenseKeyResponse> {
  const result = await fetchLicenseApi<{ key: string }>(`/get-license?userId=${userId}`, {
    endpoint: 'get-license',
    figmaId: userId,
  });

  if (result.ok) return result.data;

  return { error: result.message ?? 'Error fetching license' };
}
