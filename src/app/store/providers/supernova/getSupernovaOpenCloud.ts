/** Returns a URL to a page where the user can create a pull request with a given branch */
export function getSupernovaOpenCloud(
  id: string,
) {
  const baseUrl = 'https://cloud.supernova.io';

  return `${baseUrl}/ws/todo/ds/${id}-design-system/latest`;
}
