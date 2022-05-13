import type{ LicenseStatus } from '@/constants/LicenseStatus';
import type { UserState } from '../../userState';

export function setLicenseStatus(state: UserState, payload: LicenseStatus): UserState {
  return {
    ...state,
    licenseStatus: payload,
  };
}
