class MessageEvent extends Event {
  constructor(pluginMessage) {
    super('message')
    this.data = { pluginMessage }
  }
}

/** @type {[string, (...args: any[]) => any][]} */
const figmaOnHandlers = []
/** @type {[string, (...args: any[]) => any][]} */
const figmaUiOnHandlers = []
/** @type {[string, (...args: any[]) => any][]} */
const figmaCodegenOnHandlers = []


module.exports.dispatchFigmaEvent = jest.fn((name, args) => {
  figmaOnHandlers
    .filter((handler) => handler[0] === name)
    .forEach((handler) => handler[1].apply(undefined, args))
})
module.exports.mockShowUI = jest.fn(() => {});
module.exports.mockOn = jest.fn((name, handler) => {
  figmaOnHandlers.push([name, handler])
});
module.exports.mockCodegenOn = jest.fn((eventName, handler) => {
  figmaCodegenOnHandlers.push([eventName, handler]);
});
module.exports.mockGetAsync = jest.fn(() => Promise.resolve());
module.exports.mockSetAsync = jest.fn(() => Promise.resolve());
module.exports.mockKeysAsync = jest.fn(() => Promise.resolve([]));
module.exports.mockNotify = jest.fn(() => Promise.resolve({}));
module.exports.mockGetLocalPaintStyles = jest.fn(() => []);
module.exports.mockGetLocalTextStyles = jest.fn(() => []);
module.exports.mockGetLocalEffectStyles = jest.fn(() => []);
module.exports.mockLoadFontAsync = jest.fn(() => Promise.resolve());
module.exports.mockCreateTextStyle = jest.fn(() => ({
  id: 'textstyle',
}));
module.exports.mockCreatePaintStyle = jest.fn(() => ({
  id: 'paintstyle',
}));
module.exports.mockCreateEffectStyle = jest.fn(() => ({
  id: 'effectstyle',
}));
module.exports.mockGetStyleById = jest.fn((id) => ({
  id,
}));
module.exports.mockImportStyleByKeyAsync = jest.fn(() => Promise.reject());
module.exports.mockUiOn = jest.fn((eventName, handler) => {
  figmaUiOnHandlers.push([eventName, handler]);
});
module.exports.mockUiOff = jest.fn((eventName, handler) => {
  const indexOf = figmaUiOnHandlers.findIndex((entry) => (
    entry[0] === eventName
    && entry[1] === handler
  ))
  if (indexOf > -1) {
    figmaUiOnHandlers.splice(indexOf, 1)
  }
});
module.exports.mockUiPostMessage = jest.fn((pluginMessage) => {
  window.dispatchEvent(new MessageEvent(pluginMessage))
});
module.exports.mockRootSetSharedPluginData = jest.fn(() => {});
module.exports.mockRootGetSharedPluginData = jest.fn(() => {});
module.exports.mockRootFindAll = jest.fn(() => []);
module.exports.mockRootFindAllWithCriteria = jest.fn(() => []);
module.exports.mockParentPostMessage = jest.fn((data) => {
  figmaUiOnHandlers
    .filter(([eventName]) => eventName === 'message')
    .forEach(([,handler]) => handler(data.pluginMessage))
});
module.exports.mockGetNodeById = jest.fn();
module.exports.mockScrollAndZoomIntoView = jest.fn();
module.exports.mockCreateImage = jest.fn();
module.exports.mockGetLocalVariables = jest.fn(() => ([]));
module.exports.mockGetLocalVariablesAsync = jest.fn(() => Promise.resolve([]));
module.exports.mockCreateVariable = jest.fn();
module.exports.mockGetLocalVariableCollections = jest.fn();
module.exports.mockGetLocalVariableCollectionsAsync = jest.fn();
module.exports.mockCreateVariableCollection = jest.fn();
module.exports.mockImportVariableByKeyAsync = jest.fn();
module.exports.mockGetVariableById = jest.fn();
module.exports.mockSetValueForMode = jest.fn();
module.exports.mockSetBoundVariableForPaint = jest.fn();
module.exports.mockListAvailableFontsAsync = jest.fn(() => Promise.resolve([{fontName: {family: 'Roboto', style: 'Bold'}}, {fontName: {family: 'Inter', style: 'Regular'}}]));

module.exports.figma = {
  showUI: module.exports.mockShowUI,
  on: module.exports.mockOn,
  currentPage: {
    selection: [],
  },
  viewport: {
    scrollAndZoomIntoView: module.exports.mockScrollAndZoomIntoView,
  },
  clientStorage: {
    getAsync: module.exports.mockGetAsync,
    setAsync: module.exports.mockSetAsync,
    keysAsync: module.exports.mockKeysAsync,
  },
  notify: module.exports.mockNotify,
  codegen: {
    on: module.exports.mockCodegenOn,
  },
  ui: {
    postMessage: module.exports.mockUiPostMessage,
    on: module.exports.mockUiOn,
    off: module.exports.mockUiOff,
  },
  root: {
    setSharedPluginData: module.exports.mockRootSetSharedPluginData,
    getSharedPluginData: module.exports.mockRootGetSharedPluginData,
    findAll: module.exports.mockRootFindAll,
    findAllWithCriteria: module.exports.mockRootFindAllWithCriteria,
  },
  variables: {
    getLocalVariables: module.exports.mockGetLocalVariables,
    getLocalVariablesAsync: module.exports.mockGetLocalVariablesAsync,
    createVariable: module.exports.mockCreateVariable,
    getLocalVariableCollections: module.exports.mockGetLocalVariableCollections,
    getLocalVariableCollectionsAsync: module.exports.mockGetLocalVariableCollectionsAsync,
    createVariableCollection: module.exports.mockCreateVariableCollection,
    importVariableByKeyAsync: module.exports.mockImportVariableByKeyAsync,
    getVariableById: module.exports.mockGetVariableById,
    setValueForMode: module.exports.mockSetValueForMode,
    setBoundVariableForPaint: module.exports.mockSetBoundVariableForPaint
  },
  getLocalPaintStyles: module.exports.mockGetLocalPaintStyles,
  getLocalPaintStylesAsync: module.exports.mockGetLocalPaintStyles,
  getLocalTextStyles: module.exports.mockGetLocalTextStyles,
  getLocalTextStylesAsync: module.exports.mockGetLocalTextStyles,
  getLocalEffectStyles: module.exports.mockGetLocalEffectStyles,
  getLocalEffectStylesAsync: module.exports.mockGetLocalEffectStyles,
  loadFontAsync: module.exports.mockLoadFontAsync,
  getStyleById: module.exports.mockGetStyleById,
  createTextStyle: module.exports.mockCreateTextStyle,
  createPaintStyle: module.exports.mockCreatePaintStyle,
  createEffectStyle: module.exports.mockCreateEffectStyle,
  importStyleByKeyAsync: module.exports.mockImportStyleByKeyAsync,
  getNodeById: module.exports.mockGetNodeById,
  createImage: module.exports.mockCreateImage,
  listAvailableFontsAsync: module.exports.mockListAvailableFontsAsync,
};

parent.postMessage = module.exports.mockParentPostMessage;
global.figma = module.exports.figma;
global.__html__ = '';
