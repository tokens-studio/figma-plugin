export interface GroupMetadata {
  description: string;
  lastModified?: string;
}

export interface GroupMetadataMap {
  [tokenSet: string]: {
    [path: string]: GroupMetadata;
  };
}