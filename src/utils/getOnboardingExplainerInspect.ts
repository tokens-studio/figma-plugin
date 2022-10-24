import { OnboardingExplainerInspectProperty, LastOpenedProperty } from '@/figmaStorage';

export default async function getOnboardingExplainerInspect() {
  let data: boolean = true;
  let lastopend: number = 0;
  try {
    // Set onboarding explainer status as true if lastopend none existed
    lastopend = await LastOpenedProperty.read() || 0;
    if (lastopend) {
      data = await OnboardingExplainerInspectProperty.read() || false;
      await OnboardingExplainerInspectProperty.write(false);
    } else {
      data = true;
      await OnboardingExplainerInspectProperty.write(true);
    }
  } catch (e) {
    console.error('error retrieving onboardingExplainerInspect', e);
    await OnboardingExplainerInspectProperty.write(true);
    data = true;
  }

  return data;
}
