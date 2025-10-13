// Metadata for a token set, including group-level descriptions
export type TokenSetMetadata = {
  // Group path to its metadata (e.g., "colors.primary" -> { $description: "..." })
  groups?: Record<string, GroupMetadata>;
  // Root-level metadata
  root?: GroupMetadata;
};

export type GroupMetadata = {
  $description?: string;
  $extensions?: Record<string, any>;
};
