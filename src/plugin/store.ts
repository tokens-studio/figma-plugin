type State = {
  inspectDeep: boolean
  shouldSendSelectionValues: boolean
  successfulNodes: Set<BaseNode | SceneNode>;
};

const store: State = {
  inspectDeep: false,
  shouldSendSelectionValues: false,
  successfulNodes: new Set(),
};

export default store;
