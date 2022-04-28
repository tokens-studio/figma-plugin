export default async function removeLicense(
  licenseKey: string,
  userId: string | null,
): Promise<{ key?: string; error?: string }> {
  try {
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, userId }),
    };
    const res = await fetch(
      'https://d1cd-2a02-2f08-e207-d400-2127-aa1b-76e-1c5a.ngrok.io/detach-license',
      requestOptions,
    );

    if (res.status === 200) {
      const key = await res.json();
      return { key };
    }

    const { message } = await res.json();
    return {
      error: message,
    };
  } catch (e) {
    console.log(e);
    return {
      error: 'Error removing license',
    };
  }
}
