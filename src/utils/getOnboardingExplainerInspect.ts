import { OnboardingExplainerInspectProperty } from '@/figmaStorage';

export default async function getOnboardingExplainerInspect() {
  let data: string = 'true';
  try {
    // Set specific date as lastOpened if none existed (when we started the changelog)
    data = await OnboardingExplainerInspectProperty.read() || 'true';
    await OnboardingExplainerInspectProperty.write('true');
  } catch (e) {
    console.error('error retrieving onboardingExplainerInspect', e);
    await OnboardingExplainerInspectProperty.write('true');
    data = 'true';
  }

  return data;
}
