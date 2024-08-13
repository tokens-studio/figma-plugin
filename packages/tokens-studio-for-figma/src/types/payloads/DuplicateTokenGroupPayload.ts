export type DuplicateTokenGroupPayload = {
  parent: string;
  oldName: string;
  newName: string;
  tokenSets: string[];
  type: string;
};
