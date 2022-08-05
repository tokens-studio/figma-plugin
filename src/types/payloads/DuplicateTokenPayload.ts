export type DuplicateTokenPayload = {
  parent: string;
  newName: string;
  oldName?: string;
  shouldUpdate?: boolean;
};
