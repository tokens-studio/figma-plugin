export default async function fetchEntitlementsForLicense(licenseKey: string) {
  try {
    const res = await fetch(
      `https://f080-2a02-2f08-e207-d400-8817-f18d-851f-5742.ngrok.io/get-entitlements?licenseKey=${licenseKey}`,
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (res.status === 200) {
      const parsed = await res.json();
      return parsed;
    }
  } catch (e) {
    console.log('Error checkout', e);
  }
  return null;
}
