module.exports.mockGetAsync = jest.fn(() => Promise.resolve());
module.exports.mockSetAsync = jest.fn(() => Promise.resolve());
module.exports.mockNotify = jest.fn(() => Promise.resolve({}));
module.exports.mockPostMessage = jest.fn(() => Promise.resolve({}));
module.exports.mockGetLocalPaintStyles = jest.fn(() => []);
module.exports.mockGetLocalTextStyles = jest.fn(() => []);
module.exports.mockGetLocalEffectStyles = jest.fn(() => []);
module.exports.mockLoadFontAsync = jest.fn(() => Promise.resolve());
module.exports.mockCreateTextStyle = jest.fn();
module.exports.mockCreatePaintStyle = jest.fn();
module.exports.mockCreateEffectStyle = jest.fn();
module.exports.mockImportStyleByKeyAsync = jest.fn(() => Promise.reject());
module.exports.mockUiOn = jest.fn(() => {})

global.figma = {
  clientStorage: {
    getAsync: module.exports.mockGetAsync,
    setAsync: module.exports.mockSetAsync,
  },
  notify: module.exports.mockNotify,
  ui: {
    postMessage: module.exports.mockPostMessage,
    on: module.exports.mockUiOn,
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
