import { mockGetAsync, mockSetAsync } from '../../../tests/__mocks__/figmaMock';
import { LastOpenedProperty } from '../LastOpenedProperty';

describe('LastOpenedProperty', () => {
  it('should be able to write', async () => {
    await LastOpenedProperty.write(1664078400000);
    expect(mockSetAsync).toBeCalledTimes(1);
    expect(mockSetAsync).toBeCalledWith('lastOpened', '1664078400000');
  });

  it('should be able to read', async () => {
    mockGetAsync.mockResolvedValueOnce('1664078400000');
    expect(await LastOpenedProperty.read()).toEqual(1664078400000);
  });
});
