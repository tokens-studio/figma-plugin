import { readFile, writeFile } from 'fs/promises';
// import * as fs from 'fs-extra';
import * as url from 'url';
import path from 'path';
import figmaHelper from 'figcd/src/figma-helper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __filename = url.fileURLToPath(import.meta.url);






async function updatePackageVersion(packageFile, minorVersion) {
  const packageDataRaw = await readFile(packageFile, 'utf8');
  const packageData = JSON.parse(packageDataRaw);
  const version = packageData?.figma?.version || '0';
  const versionParts = version.split('.');
  versionParts[versionParts.length - 1] = minorVersion.toString();
  const updatedVersion = versionParts.join('.');
  await writeFile(packageFile, JSON.stringify({
    ...packageData,
    figma: {
      ...packageData.figma,
      version: updatedVersion
    }
  }, null, 2), 'utf8');
}

const serializeCookies = (cookies, custom) => {
  if (custom) {
      return `${Object.keys(cookies).reduce((acc, k) => {
          acc += `${k}=${cookies[k]};`
          return acc;
      }, '')}; ${custom}`;
  }
  return Object.keys(cookies).reduce((acc, k) => {
      acc += `${k}=${cookies[k]};`
      return acc;
  }, '');
}

export const getPluginVersion = async () => {
  const authNToken = process.env.FIGMA_WEB_AUTHN_TOKEN;
  if (!authNToken) {
    throw new Error('No Figma auth token found');
  }
  try {
    const pluginInfo = await figmaHelper.getPluginInfo(path.join(__dirname, '../manifest.json'), authNToken)
    return pluginInfo.currentVersionNumber;
  } catch(err) {
    // if (err.message.includes('does not have access')) {
    console.log(err.message)

    const manifestDataRaw = await readFile(path.join(__dirname, '../manifest.json'), 'utf8');
    const manifestData = JSON.parse(manifestDataRaw);
    const pluginsResponse = await fetch('https://www.figma.com/api/search/extensions?query=tokens%20studio%20for%20figmа&editor_type=figma&max_num_results=20', {
      "headers": {
        "accept": "application/json",
        "content-type": "application/json",
        "cookie": serializeCookies({
            "__Host-figma.authn": authNToken,
        }, null),
        "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        "Referer": "https://www.figma.com/",
        "Referrer-Policy": "origin-when-cross-origin"
      },
      "method": 'GET'
    });
    const publishRequestJson = await pluginsResponse.json();
    const pluginModel = publishRequestJson.meta.results.public.find(({ model }) => model.id === manifestData.id).model;
    const version = pluginModel.versions[pluginModel.current_plugin_version_id].version;
    return version;
  }
}

export async function prepare() {
  const packageFile = path.join(__dirname, '../package.json');
  const currentVersionNumber = Number(await getPluginVersion());
  if (!currentVersionNumber || isNaN(currentVersionNumber)) {
    throw new Error('Failed to get current plugin version');
  }
  await updatePackageVersion(packageFile, currentVersionNumber + 1)
  console.log('Minor Version in '+ packageFile + ' updated to '+ (currentVersionNumber + 1))
}
