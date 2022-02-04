const mockFetchPromise = Promise.resolve({
  json: () => Promise.resolve({}),
});
global.fetch = jest.fn(() => mockFetchPromise);
