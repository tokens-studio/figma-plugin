export default async function validateLicense(licenseKey: string, userId: string | null): Promise<boolean> {
  try {
    const res = await fetch(
      `https://stripe-keygen.herokuapp.com/validate-license?licenseKey=${licenseKey}&userId=${userId}`,
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
    console.error('Error validating license', e);
    return false;
  }

  return false;
}
