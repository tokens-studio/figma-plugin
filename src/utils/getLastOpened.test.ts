import getLastOpened from './getLastOpened';

describe('fetchChangelog', () => {
  it('user lanch the plugin for the first time', async () => {
    expect.assertions(1);
    try {
      expect(await getLastOpened()).toEqual(0);
    } catch (e) {
      expect(await getLastOpened()).toEqual(0);
    }
  });
});
