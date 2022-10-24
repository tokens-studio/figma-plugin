import { OnboardingExplainerSyncProvidersProperty, LastOpenedProperty } from '@/figmaStorage';

export default async function getOnboardingExplainerSyncProviders() {
  let data: boolean = true;
  let lastopend: number = 0;
  try {
    // Set onboarding explainer status as true if lastopend none existed
    lastopend = await LastOpenedProperty.read() || 0;
    if (lastopend) {
      data = await OnboardingExplainerSyncProvidersProperty.read() || false;
      await OnboardingExplainerSyncProvidersProperty.write(false);
    } else {
      data = true;
      await OnboardingExplainerSyncProvidersProperty.write(true);
    }
  } catch (e) {
    console.error('error retrieving onboardingExplainerSyncProviders', e);
    await OnboardingExplainerSyncProvidersProperty.write(true);
    data = true;
  }

  return data;
}
