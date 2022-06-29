class MessageEvent extends Event {
  constructor(data) {
    super('message')
    this.data = data;
  }
}

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
module.exports.mockUiOn = jest.fn(() => {});
module.exports.mockRootSetSharedPluginData = jest.fn(() => {});
module.exports.mockRootGetSharedPluginData = jest.fn(() => {});
module.exports.mockPostMessage = jest.fn((message) => {
  window.dispatchEvent(new MessageEvent({
    pluginMessage: message,
  }))
});

global.__html__ = '';
global.figma = {
  showUI: module.exports.mockShowUI,
  on: module.exports.mockOn,
  clientStorage: {
    getAsync: module.exports.mockGetAsync,
    setAsync: module.exports.mockSetAsync,
  },
  notify: module.exports.mockNotify,
  ui: {
    postMessage: module.exports.mockPostMessage,
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
