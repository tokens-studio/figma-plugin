import validateLicenseWithStudio from '../validateLicenseWithStudio';
import validateLicense from '../validateLicense';
import validateLicenseStudio from '../validateLicenseStudio';

jest.mock('../validateLicense', () => jest.fn());
jest.mock('../validateLicenseStudio', () => jest.fn());

const mockValidateLicense = validateLicense as jest.MockedFunction<typeof validateLicense>;
const mockValidateLicenseStudio = validateLicenseStudio as jest.MockedFunction<typeof validateLicenseStudio>;

describe('validateLicenseWithStudio', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the studio result when studio validation succeeds', async () => {
    mockValidateLicense.mockResolvedValue({ plan: 'legacy plan', email: 'a@b.c' });
    mockValidateLicenseStudio.mockResolvedValue({ plan: 'studio plan', email: 'a@b.c' });

    const result = await validateLicenseWithStudio('KEY', 'user-1', 'Name');

    expect(result.plan).toBe('studio plan');
    expect(mockValidateLicense).toHaveBeenCalledWith('KEY', 'user-1', 'Name');
    expect(mockValidateLicenseStudio).toHaveBeenCalledWith('KEY', 'user-1', 'Name');
  });

  it('falls back to the legacy result when studio validation fails', async () => {
    mockValidateLicense.mockResolvedValue({ plan: 'legacy plan' });
    mockValidateLicenseStudio.mockResolvedValue({ error: 'No license was found' });

    const result = await validateLicenseWithStudio('KEY', 'user-1');

    expect(result).toEqual({ plan: 'legacy plan' });
  });

  it('returns the legacy error when both backends fail', async () => {
    mockValidateLicense.mockResolvedValue({ error: 'License key is expired' });
    mockValidateLicenseStudio.mockResolvedValue({ error: 'No license was found' });

    const result = await validateLicenseWithStudio('KEY', 'user-1');

    expect(result.error).toBe('License key is expired');
  });
});
