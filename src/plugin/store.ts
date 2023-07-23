type State = {
  inspectDeep: boolean | null
  shouldSendSelectionValues: boolean
  successfulNodes: Set<BaseNode | SceneNode>;
};

const store: State = {
  inspectDeep: null,
  shouldSendSelectionValues: false,
  successfulNodes: new Set(),
};

export default store;
