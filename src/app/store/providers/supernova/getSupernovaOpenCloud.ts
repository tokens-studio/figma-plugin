/** Returns a URL to a user workspace. If no workspace is provided, opens url to primary cloud environment that redirects to the first DS automatically */
export function getSupernovaOpenCloud(url: string | undefined) {
  return url ?? 'https://cloud.supernova.io';
}
