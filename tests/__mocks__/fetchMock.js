module.exports.mockFetch = jest.fn((arg0, arg1) => {
  return (
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({})
    })
  )
})
global.fetch = module.exports.mockFetch;
