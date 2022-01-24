type State = {
  remoteComponents: Set<BaseNode | SceneNode>;
  successfulNodes: Set<BaseNode | SceneNode>;
};

const store: State = {
  remoteComponents: new Set(),
  successfulNodes: new Set(),
};

export default store;
