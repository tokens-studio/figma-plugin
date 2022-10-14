import { OnboardingFlagProperty } from '@/figmaStorage';

export default async function getOnboardingFlag(): Promise<boolean> {
  let data: boolean = true;
  try {
    // Set specific date as lastOpened if none existed (when we started the changelog)
    data = await OnboardingFlagProperty.read() || true;
    await OnboardingFlagProperty.write(true);
  } catch (e) {
    console.error('error retrieving onboardingFlag', e);
    await OnboardingFlagProperty.write(true);
    data = true;
  }

  return data;
}
