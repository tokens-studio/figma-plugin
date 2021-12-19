type State = {
    remoteComponents: (BaseNode | SceneNode)[];
    successfulNodes: (BaseNode | SceneNode)[];
};

const store: State = {
    remoteComponents: [],
    successfulNodes: [],
};

export default store;
