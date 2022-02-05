global.figma = {
  clientStorage: {
    getAsync: jest.fn(() => Promise.resolve()),
    setAsync: jest.fn(() => Promise.resolve()),
  },
  notify: jest.fn(() => Promise.resolve({})),
  ui: {
    postMessage: jest.fn(() => Promise.resolve({})),
  },
  getLocalPaintStyles: jest.fn(() => []),
  getLocalTextStyles: jest.fn(() => []),
  getLocalEffectStyles: jest.fn(() => []),
  loadFontAsync: jest.fn(() => Promise.resolve()),
  createTextStyle: jest.fn(),
};
