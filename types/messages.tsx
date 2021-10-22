export enum MessageFromPluginTypes {
    SELECTION = 'selection',
    NO_SELECTION = 'noselection',
    REMOTE_COMPONENTS = 'remotecomponents',
    TOKEN_VALUES = 'tokenvalues',
    STYLES = 'styles',
    RECEIVED_STORAGE_TYPE = 'receivedStorageType',
    API_CREDENTIALS = 'apiCredentials',
    API_PROVIDERS = 'apiProviders',
    USER_ID = 'userId',
    RECEIVED_LAST_OPENED = 'receivedLastOpened',
    UI_SETTINGS = 'uiSettings',
}

export enum MessageToPluginTypes {
    INITIATE = 'initiate',
    REMOVE_SINGLE_CREDENTIAL = 'remove-single-credential',
    GO_TO_NODE = 'gotonode',
    CREDENTIALS = 'credentials',
    UPDATE = 'update',
    CREATE_STYLES = 'create-styles',
    SET_NODE_DATA = 'set-node-data',
    REMOVE_NODE_DATA = 'remove-node-data',
    PULL_STYLES = 'pull-styles',
    SET_STORAGE_TYPE = 'set-storage-type',
    NOTIFY = 'notify',
    SET_UI = 'set_ui',
    RESIZE_WINDOW = 'resize_window',
}
