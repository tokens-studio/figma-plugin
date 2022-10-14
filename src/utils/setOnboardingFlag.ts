import { OnboardingFlagProperty } from '@/figmaStorage';

export default async function setOnboardingFlag(): Promise<boolean> {
  let data: boolean = false;
  try {
    // Set specific date as lastOpened if none existed (when we started the changelog)
    data = await OnboardingFlagProperty.read() || false;
    await OnboardingFlagProperty.write(false);
  } catch (e) {
    console.error('error retrieving onboardingFlag', e);
    await OnboardingFlagProperty.write(false);
    data = true;
  }

  return data;
}
