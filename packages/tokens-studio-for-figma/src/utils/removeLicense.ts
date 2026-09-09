import { fetchLicenseApi } from './licenseApi';

export default async function removeLicense(
  licenseKey: string,
  userId: string | null,
): Promise<{ key?: string; error?: string }> {
  // MIGRATION: detach fails over like the reads do. While both systems are
  // live a detach the primary accepts leaves the seat attached on the legacy
  // host, so re-run the import as a delta sync before switching it off.
  const result = await fetchLicenseApi<string>('/detach-license', {
    endpoint: 'detach-license',
    figmaId: userId,
    init: {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, userId }),
    },
  });

  if (result.ok) return { key: result.data };

  return { error: result.message ?? 'Error removing license' };
}
