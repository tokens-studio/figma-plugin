export type VariableCollectionInfo = {
  id: string;
  name: string;
  modes: {
    modeId: string;
    name: string;
  }[];
  parentCollectionId?: string;
  isExtended?: boolean;
};

export type SelectedCollections = {
  [collectionId: string]: {
    name: string;
    selectedModes: string[]; // array of modeIds
  };
};
