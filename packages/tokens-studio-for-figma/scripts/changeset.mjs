export async function publishChangeset(version, _title, content) {
  const tkn = process.env.FEATUREBASE_TOKEN;

  const title = _title || version;
  const url = 'https://do.featurebase.app/v2/changelog';
  const data = {
    title: title,
    markdownContent: Array.isArray(content) ? content.join('\n') : content,
    // changelogCategories: ['New', 'Fixed', 'Improved'],
    state: 'draft',
    // featuredImage: 'http://example.com/image.png',
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': tkn,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  try {
    const resJson = await res.json();
    if (resJson.success && resJson.results.slug) {
      return `https://feedback.tokens.studio/changelog/${resJson.results.slug}`;
    }
  } catch (err) {
    console.log(err);
  }
}
