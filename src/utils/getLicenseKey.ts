export default async function getLicenseKey(userId: string | null): Promise<{ key?: string; error?: string }> {
  try {
    const res = await fetch(`${process.env.LICENSE_API_URL}/get-license?userId=${userId}`);
    if (res.status === 200) {
      return await res.json();
    }

    const { message } = await res.json();
    return {
      error: message,
    };
  } catch (e) {
    console.log(e);
    return {
      error: 'Error validating license',
    };
  }
}
