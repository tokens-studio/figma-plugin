// The message for tokens an import couldn't send to a Tokens Studio project in Simple view, because their set
// isn't one of its modes' sets. Studio makes sets only with a collection or a mode.
export function refusedSetsMessage(setNames: string[]): string {
  const unique = Array.from(new Set(setNames));
  const listed = unique.slice(0, 3).map((name) => `"${name}"`).join(', ');
  const more = unique.length > 3 ? ` and ${unique.length - 3} more` : '';
  return 'This project uses Simple view in Tokens Studio, where sets follow collections and modes. '
    + `Nothing was imported into ${listed}${more}: add the collection and its modes in Manage themes first, then import again.`;
}
