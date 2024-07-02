import getLastOpened from './getLastOpened';
import { mockGetAsync } from '../../tests/__mocks__/figmaMock';

describe('fetchChangelog', () => {
  it('user lanch the plugin for the first time', async () => {
    expect.assertions(1);
    try {
      expect(await getLastOpened()).toEqual(0);
    } catch (e) {
      expect(await getLastOpened()).toEqual(0);
    }
  });

  it('user lanch the plugin for not the first time', async () => {
    mockGetAsync.mockResolvedValueOnce('1664078400000');
    expect(await getLastOpened()).toEqual(1664078400000);
  });

  it('sets current date even if theres an error reading', async () => {
    mockGetAsync.mockImplementation(() => {
      throw new Error('Error');
    });

    expect(await getLastOpened()).toEqual(0);
  });
});
