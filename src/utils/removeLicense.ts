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
    const res = await fetch(`${process.env.LICENSE_API_URL}/detach-license`, requestOptions);
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
