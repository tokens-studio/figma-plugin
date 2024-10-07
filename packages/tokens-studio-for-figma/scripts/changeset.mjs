// import JSZip from 'jszip';
// import { glob } from 'glob';
// import * as fs from 'fs-extra';

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

async function changeset() {
  const version = '0.0.1';
  const title = version;
  const markdownContent = '**Hello, World!**';
  const url = 'https://do.featurebase.app/v2/changelog';
  const data = {
    title,
    markdownContent,
    // changelogCategories: ['New', 'Fixed', 'Improved'],
    state: 'draft',
    // featuredImage: 'http://example.com/image.png',
  };

  console.log('url', { data });


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

changeset();
