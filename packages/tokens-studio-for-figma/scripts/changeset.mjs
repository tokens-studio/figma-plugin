const TKN = process.env.FEATUREBASE_TOKEN;

// type CreateChangelogResponse = {
//   results: {
//       "title": string,
//       "slug": string,
//       "content": string,
//       "markdownContent": string,
//       "date": string,
//       "state": string,
//       "sendNotification": boolean,
//       "emailSentToSubscribers": boolean,
//       "commentCount": number,
//       "changelogCategories": {
//               "name": string,
//               "roles": string[],
//               "id": string,
//           }[],
//       "organization": string,
//       "id": string,
//   },
//   success: boolean,
// }

export async function publishChangeset(version, _title, content) {
  const title = _title || version;
  const url = 'https://do.featurebase.app/v2/changelog';
  const data = {
    title: title,
    markdownContent: Array.isArray(content) ? content.join('\n') : content,
    // changelogCategories: ['New', 'Fixed', 'Improved'],
    state: 'draft',
    // featuredImage: 'http://example.com/image.png',
  };

  console.log('await fetch(url, { ... })', JSON.stringify({ url, data }, null, 2));

  // const res = await fetch(url, {
  //   method: 'POST',
  //   headers: {
  //     'X-API-Key': TKN,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(data)
  // });
  // console.log({ res })

  // try {
  //   const resJson = await res.json();

  //   if (resJson.success) {
  //     console.log('success');
  //   }
  // } catch (err) {
  //   // console.log({ res });
  //   console.log(err);
  // }
}
