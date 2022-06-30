class MessageEvent extends Event {
  constructor(pluginMessage) {
    super('message')
    this.data = { pluginMessage }
  }
}

/** @type {[string, (...args: any[]) => any][]} */
const figmaUiOnHandlers = []

module.exports.mockShowUI = jest.fn(() => {});
module.exports.mockOn = jest.fn(() => {});
module.exports.mockGetAsync = jest.fn(() => Promise.resolve());
module.exports.mockSetAsync = jest.fn(() => Promise.resolve());
module.exports.mockNotify = jest.fn(() => Promise.resolve({}));
module.exports.mockGetLocalPaintStyles = jest.fn(() => []);
module.exports.mockGetLocalTextStyles = jest.fn(() => []);
module.exports.mockGetLocalEffectStyles = jest.fn(() => []);
module.exports.mockLoadFontAsync = jest.fn(() => Promise.resolve());
module.exports.mockCreateTextStyle = jest.fn();
module.exports.mockCreatePaintStyle = jest.fn();
module.exports.mockCreateEffectStyle = jest.fn();
module.exports.mockImportStyleByKeyAsync = jest.fn(() => Promise.reject());
module.exports.mockUiOn = jest.fn((eventName, handler) => {
  figmaUiOnHandlers.push([eventName, handler]);
});
module.exports.mockUiPostMessage = jest.fn((pluginMessage) => {
  window.dispatchEvent(new MessageEvent(pluginMessage))
});
module.exports.mockRootSetSharedPluginData = jest.fn(() => {});
module.exports.mockRootGetSharedPluginData = jest.fn(() => {});
module.exports.mockParentPostMessage = jest.fn((data) => {
  figmaUiOnHandlers
    .filter(([eventName]) => eventName === 'message')
    .forEach(([,handler]) => handler(data.pluginMessage))
});

module.exports.figma = {
  showUI: module.exports.mockShowUI,
  on: module.exports.mockOn,
  currentPage: {
    selection: [],
  },
  clientStorage: {
    getAsync: module.exports.mockGetAsync,
    setAsync: module.exports.mockSetAsync,
  },
  notify: module.exports.mockNotify,
  ui: {
    postMessage: module.exports.mockUiPostMessage,
    on: module.exports.mockUiOn,
  },
  root: {
    setSharedPluginData: module.exports.mockRootSetSharedPluginData,
    getSharedPluginData: module.exports.mockRootGetSharedPluginData,
  },
  getLocalPaintStyles: module.exports.mockGetLocalPaintStyles,
  getLocalTextStyles: module.exports.mockGetLocalTextStyles,
  getLocalEffectStyles: module.exports.mockGetLocalEffectStyles,
  loadFontAsync: module.exports.mockLoadFontAsync,
  createTextStyle: module.exports.mockCreateTextStyle,
  createPaintStyle: module.exports.mockCreatePaintStyle,
  createEffectStyle: module.exports.mockCreateEffectStyle,
  importStyleByKeyAsync: module.exports.mockImportStyleByKeyAsync,
};

parent.postMessage = module.exports.mockParentPostMessage;
global.figma = module.exports.figma;
global.__html__ = '';
