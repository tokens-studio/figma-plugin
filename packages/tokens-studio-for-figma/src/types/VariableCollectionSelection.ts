export type VariableCollectionInfo = {
  id: string;
  name: string;
  isExtension?: boolean; // NEW: identifies extended collections
  parentCollectionId?: string; // NEW: parent collection reference for extended collections
  modes: Array<{
    modeId: string;
    name: string;
    parentModeId?: string; // NEW: parent mode reference for extended collections
  }>;
};

export type SelectedCollections = {
  [collectionId: string]: {
    name: string;
    selectedModes: string[]; // array of modeIds
  };
};
