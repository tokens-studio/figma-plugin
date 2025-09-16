export type VariableCollectionInfo = {
  id: string;
  name: string;
  modes: {
    modeId: string;
    name: string;
  }[];
};

export type SelectedCollections = {
  [collectionId: string]: {
    name: string;
    selectedModes: string[]; // array of modeIds
  };
};
