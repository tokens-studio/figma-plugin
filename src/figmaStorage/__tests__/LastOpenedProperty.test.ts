import { mockGetAsync, mockSetAsync } from '../../../tests/__mocks__/figmaMock';
import { LastOpenedProperty } from '../LastOpenedProperty';

describe('LastOpenedProperty', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
    jest.setSystemTime(new Date(2022, 8, 25, 0, 0, 0));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should be able to write', async () => {
    await LastOpenedProperty.write(Date.now());
    expect(mockSetAsync).toBeCalledTimes(1);
    expect(mockSetAsync).toBeCalledWith('lastOpened', '1664078400000');
  });

  it('should be able to read', async () => {
    mockGetAsync.mockResolvedValueOnce(String(Date.now()));
    expect(await LastOpenedProperty.read()).toEqual(Date.now());
  });
});
