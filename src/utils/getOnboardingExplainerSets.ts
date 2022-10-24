import { OnboardingExplainerSetsProperty, LastOpenedProperty } from '@/figmaStorage';

export default async function getOnboardingExplainerSets() {
  let data: boolean = true;
  let lastopend: number = 0;
  try {
    // Set onboarding explainer status as true if lastopend none existed
    lastopend = await LastOpenedProperty.read() || 0;
    if (lastopend) {
      data = await OnboardingExplainerSetsProperty.read() || false;
      await OnboardingExplainerSetsProperty.write(false);
    } else {
      data = true;
      await OnboardingExplainerSetsProperty.write(true);
    }
  } catch (e) {
    console.error('error retrieving onboardingExplainerSets', e);
    await OnboardingExplainerSetsProperty.write(true);
    data = true;
  }

  return data;
}
