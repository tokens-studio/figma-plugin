import { licenseDetailsSelector } from '../licenseDetailsSelector';
import type { RootState } from '@/app/store';

describe('licenseDetailsSelector', () => {
  it('should work', () => {
    const mockState = {
      userState: {
        licenseDetails: {
          plan: 'pro',
          clientEmail: 'example@domain.com',
          entitlements: [],
        },
      },
    } as unknown as RootState;

    expect(licenseDetailsSelector(mockState)).toEqual({
      plan: 'pro',
      clientEmail: 'example@domain.com',
      entitlements: [],
    });
  });
});
