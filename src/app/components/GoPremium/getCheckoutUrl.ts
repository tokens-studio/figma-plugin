export default async function getCheckoutUrl(userId: string) {
  try {
    const res = await fetch('https://f080-2a02-2f08-e207-d400-8817-f18d-851f-5742.ngrok.io/create-checkout-session', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (res.status === 200) {
      const parsed = await res.json();
      return parsed.url;
    }
  } catch (e) {
    console.log('Error checkout', e);
  }
  return null;
}
