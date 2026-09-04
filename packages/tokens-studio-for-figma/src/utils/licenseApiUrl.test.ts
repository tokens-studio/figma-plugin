import {
  LEGACY_LICENSE_API_URL,
  LICENSE_API_HOSTS,
  PRIMARY_LICENSE_API_URL,
  normalizeLicenseApiUrl,
} from './licenseApiUrl';

describe('licenseApiUrl', () => {
  it('normalizes URLs and strips trailing slashes', () => {
    expect(normalizeLicenseApiUrl('https://api-production.tokens.studio/')).toEqual('https://api-production.tokens.studio');
    expect(normalizeLicenseApiUrl('localhost:3100/')).toEqual('http://localhost:3100');
    expect(normalizeLicenseApiUrl('licence.tokens.studio')).toEqual('https://licence.tokens.studio');
  });

  it('rejects empty values', () => {
    expect(() => normalizeLicenseApiUrl('   ')).toThrow('License API URL cannot be empty');
  });

  it('tries the new production API before the legacy one', () => {
    expect(LICENSE_API_HOSTS[0]).toEqual(PRIMARY_LICENSE_API_URL);
    expect(PRIMARY_LICENSE_API_URL).toEqual('https://api-production.tokens.studio');
    expect(LICENSE_API_HOSTS).toContain(LEGACY_LICENSE_API_URL);
  });

  it('never lists the same host twice', () => {
    expect(new Set(LICENSE_API_HOSTS).size).toEqual(LICENSE_API_HOSTS.length);
  });
});
