import { FeatureFlags } from '@/utils/featureFlags';

export function useFeatureFlags() {
  async function fetchFeatureFlags(flagId: string): Promise<FeatureFlags | null> {
    try {
      const res = await fetch(`https://figma-tokens-featureflags.vercel.app/api/flag/${flagId}`, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 200) {
        const parsed = await res.json();
        return parsed;
      }
    } catch (e) {
      console.log('Error fetching feature flags', e);
    }
    return null;
  }

  return { fetchFeatureFlags };
}
