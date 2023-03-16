/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getSupernovaOpenCloud(
  url: string | undefined,
) {
  return url ?? 'https://cloud.supernova.io';
}
