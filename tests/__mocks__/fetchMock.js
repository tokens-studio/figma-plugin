module.exports.mockFetch = jest.fn(() => (
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({})
  })
))
global.fetch = module.exports.mockFetch;