import getLastOpened from './getLastOpened';

describe('fetchChangelog', () => {
  it('user lanch the plugin for the first time', async () => {
    expect(await getLastOpened()).toEqual(0);
  });
});
