import { OnboardingExplainerSyncProvidersProperty } from '@/figmaStorage';

export default async function getOnboardingExplainerSyncProviders() {
  let data: string = 'true';
  try {
    // Set specific date as lastOpened if none existed (when we started the changelog)
    data = await OnboardingExplainerSyncProvidersProperty.read() || 'true';
    await OnboardingExplainerSyncProvidersProperty.write('true');
  } catch (e) {
    console.error('error retrieving onboardingExplainerSyncProviders', e);
    await OnboardingExplainerSyncProvidersProperty.write('true');
    data = 'true';
  }

  return data;
}
