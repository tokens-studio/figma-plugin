import { UpdateMode } from '@/constants/UpdateMode';
import { mockSetAsync, mockGetAsync } from '../../../tests/__mocks__/figmaMock';
import { getUISettings, updateUISettings } from '../uiSettings';

describe('uiSettings', () => {
  it('can update the UI settings', async () => {
    await updateUISettings({
      width: 400,
      height: 400,
    });
    expect(mockSetAsync).toBeCalledWith('uiSettings', JSON.stringify({
      width: 400,
      height: 400,
    }));
  });

  it('can read the UI settings', async () => {
    mockGetAsync.mockImplementationOnce(() => Promise.resolve(JSON.stringify({
      width: 1000,
      height: 1000,
    })));
    expect(await getUISettings()).toEqual({
      width: 1000,
      height: 1000,
      showEmptyGroups: true,
      updateMode: UpdateMode.PAGE,
      updateRemote: true,
      updateOnChange: true,
      updateStyles: true,
      ignoreFirstPartForStyles: false,
      prefixStylesWithThemeName: false,
      inspectDeep: false,
    });
  });
});
