import { OnboardingFlagProperty } from '@/figmaStorage';

export default async function getOnboardingFlag() {
  let data: number = 1;
  try {
    // Set specific date as lastOpened if none existed (when we started the changelog)
    data = await OnboardingFlagProperty.read() || 1;
    await OnboardingFlagProperty.write(1);
  } catch (e) {
    console.error('error retrieving onboardingFlag', e);
    await OnboardingFlagProperty.write(1);
    data = 1;
  }

  return data;
}
