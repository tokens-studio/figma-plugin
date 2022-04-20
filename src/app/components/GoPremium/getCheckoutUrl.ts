export default async function getCheckoutUrl(userId: string) {
  try {
    const res = await fetch('https://stripe-keygen.herokuapp.com/create-checkout-session', {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({ userId }),
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
