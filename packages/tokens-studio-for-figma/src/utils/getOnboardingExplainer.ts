import {
  OnboardingExplainerSetsProperty, OnboardingExplainerSyncProvidersProperty, OnboardingExplainerInspectProperty, LastOpenedProperty,
} from '@/figmaStorage';

const data = {
  sets: true,
  syncProviders: true,
  inspect: true,
};
let lastopend: number = 0;

export default async function getOnboardingExplainer() {
  try {
    // Set onboarding explainer status as true if lastopend none existed
    lastopend = await LastOpenedProperty.read() || 0;
    if (lastopend) {
      data.sets = await OnboardingExplainerSetsProperty.read() || false;
      data.syncProviders = await OnboardingExplainerSyncProvidersProperty.read() || false;
      data.inspect = await OnboardingExplainerInspectProperty.read() || false;
    } else {
      await OnboardingExplainerSetsProperty.write(true);
      await OnboardingExplainerSyncProvidersProperty.write(true);
      await OnboardingExplainerInspectProperty.write(true);
    }
  } catch (e) {
    console.error('error retrieving onboardingExplainers', e);
    await OnboardingExplainerSetsProperty.write(true);
    await OnboardingExplainerSyncProvidersProperty.write(true);
    await OnboardingExplainerInspectProperty.write(true);
  }

  return data;
}
