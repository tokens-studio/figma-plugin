import { OnboardingExplainerSetsProperty } from '@/figmaStorage';

export default async function getOnboardingExplainerSets() {
  let data: string = 'true';
  try {
    // Set specific date as lastOpened if none existed (when we started the changelog)
    data = await OnboardingExplainerSetsProperty.read() || 'true';
    await OnboardingExplainerSetsProperty.write('true');
  } catch (e) {
    console.error('error retrieving onboardingExplainerSets', e);
    await OnboardingExplainerSetsProperty.write('true');
    data = 'true';
  }

  return data;
}
