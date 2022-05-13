type State = {
  inspectDeep: boolean
  shouldSendSelectionValues: boolean
  remoteComponents: Set<BaseNode | SceneNode>;
  successfulNodes: Set<BaseNode | SceneNode>;
};

const store: State = {
  inspectDeep: false,
  shouldSendSelectionValues: false,
  remoteComponents: new Set(),
  successfulNodes: new Set(),
};

export default store;
