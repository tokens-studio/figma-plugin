export default async function fetchEntitlementsForLicense(licenseKey: string) {
  try {
    const res = await fetch(`https://stripe-keygen.herokuapp.com/get-entitlements?licenseKey=${licenseKey}`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const parsed = await res.json();
      return parsed;
    }
  } catch (e) {
    console.log('Error getting features access for license', e);
  }
  return null;
}
