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


module.exports.dispatchFigmaEvent = jest.fn((name, args) => {
  figmaOnHandlers
    .filter((handler) => handler[0] === name)
    .forEach((handler) => handler[1].apply(undefined, args))
})
module.exports.mockShowUI = jest.fn(() => {});
module.exports.mockOn = jest.fn((name, handler) => {
  figmaOnHandlers.push([name, handler])
});
module.exports.mockGetAsync = jest.fn(() => Promise.resolve());
module.exports.mockSetAsync = jest.fn(() => Promise.resolve());
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
module.exports.mockParentPostMessage = jest.fn((data) => {
  figmaUiOnHandlers
    .filter(([eventName]) => eventName === 'message')
    .forEach(([,handler]) => handler(data.pluginMessage))
});
module.exports.mockGetNodeById = jest.fn();
module.exports.mockScrollAndZoomIntoView = jest.fn();
module.exports.mockCreateImage = jest.fn();

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
  },
  notify: module.exports.mockNotify,
  ui: {
    postMessage: module.exports.mockUiPostMessage,
    on: module.exports.mockUiOn,
    off: module.exports.mockUiOff,
  },
  root: {
    setSharedPluginData: module.exports.mockRootSetSharedPluginData,
    getSharedPluginData: module.exports.mockRootGetSharedPluginData,
    findAll: module.exports.mockRootFindAll,
  },
  getLocalPaintStyles: module.exports.mockGetLocalPaintStyles,
  getLocalTextStyles: module.exports.mockGetLocalTextStyles,
  getLocalEffectStyles: module.exports.mockGetLocalEffectStyles,
  loadFontAsync: module.exports.mockLoadFontAsync,
  getStyleById: module.exports.mockGetStyleById,
  createTextStyle: module.exports.mockCreateTextStyle,
  createPaintStyle: module.exports.mockCreatePaintStyle,
  createEffectStyle: module.exports.mockCreateEffectStyle,
  importStyleByKeyAsync: module.exports.mockImportStyleByKeyAsync,
  getNodeById: module.exports.mockGetNodeById,
  createImage: module.exports.mockCreateImage
};

parent.postMessage = module.exports.mockParentPostMessage;
global.figma = module.exports.figma;
global.__html__ = '';
