import fs from 'fs';
import path from 'path';
import * as url from 'url';
import figmaHelper from 'figcd/src/figma-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const parseMedia = (carouselMediaUrls, carouselVideoUrls) => {
  return {
    carouselMedia: Object.keys(carouselMediaUrls).length > 0
      ? Object.keys(carouselMediaUrls).map((index) => ({
        carousel_position: index,
        sha1: carouselMediaUrls[index].sha1,
      }))
      : undefined,
    carouselVideos: Object.keys(carouselVideoUrls).length > 0
      ? Object.keys(carouselVideoUrls).map((index) => ({
        carousel_position: index,
        sha1: carouselVideoUrls[index].sha1,
      }))
      : undefined,
  };
}


const authNToken = process.env.FIGMA_WEB_AUTHN_TOKEN;
const manifestPath = path.join(__dirname, '../manifest.json');
const { cookie } = await figmaHelper.getFigmaCookie();

export async function publishRelease(releaseNotes) {
    const currentPluginInfo = await figmaHelper.getPluginInfo(manifestPath, authNToken)

    const description = currentPluginInfo.currentVersion.description;
    const name = currentPluginInfo.currentVersion.name;
    const category = currentPluginInfo.category_id;
    const tagline = currentPluginInfo.currentVersion.tagline;
    const tags = currentPluginInfo.tags;
    const { carouselMedia, carouselVideos } = parseMedia(currentPluginInfo.carousel_media_urls, currentPluginInfo.carousel_videos);

    console.log('Preparing release...');
    const preparedRelease = await figmaHelper.prepareRelease(manifestPath, name, description, releaseNotes, tagline, tags, authNToken, category, cookie);
    
    const preparedVersionId = preparedRelease.version_id;
    const signature = preparedRelease.signature;

    console.log('Creating code bundle....');
    await figmaHelper.uploadCodeBundle(manifestPath, preparedRelease.code_upload_url);
    console.log('Uploading code bundle.... done');

    console.log('Releasing prepared version (' + preparedRelease.version_id + ')');
    const publishedVersion = await figmaHelper.publishRelease(
      manifestPath,
      preparedVersionId,
      signature,
      authNToken,
      cookie,
      carouselMedia,
      carouselVideos
    );
    
    console.log('Version '+ publishedVersion.plugin.versions[preparedVersionId].version +' (' + preparedVersionId + ') published');
}
