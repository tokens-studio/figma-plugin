export interface GroupMetadata {
  path: string;
  description: string;
  tokenSet: string;
  lastModified?: string;
}

export interface GroupMetadataMap {
  [key: string]: GroupMetadata; // key is `${tokenSet}.${path}`
}