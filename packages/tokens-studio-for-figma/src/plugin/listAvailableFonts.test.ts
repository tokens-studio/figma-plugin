import { listAvailableFonts, resetListAvailableFontsCache } from './listAvailableFonts';

describe('listAvailableFonts', () => {
  const fonts = [{ fontName: { family: 'Inter', style: 'Regular' } }];

  beforeEach(() => {
    resetListAvailableFontsCache();
    (figma.listAvailableFontsAsync as jest.Mock).mockReset();
  });

  it('invokes listAvailableFontsAsync once for parallel calls', async () => {
    (figma.listAvailableFontsAsync as jest.Mock).mockResolvedValue(fonts);

    const [first, second] = await Promise.all([listAvailableFonts(), listAvailableFonts()]);

    expect(first).toEqual(fonts);
    expect(second).toEqual(fonts);
    expect(figma.listAvailableFontsAsync).toHaveBeenCalledTimes(1);
  });

  it('reuses the resolved list for a sequential second call', async () => {
    (figma.listAvailableFontsAsync as jest.Mock).mockResolvedValue(fonts);

    await listAvailableFonts();
    await listAvailableFonts();

    expect(figma.listAvailableFontsAsync).toHaveBeenCalledTimes(1);
  });

  it('retries after a rejection', async () => {
    (figma.listAvailableFontsAsync as jest.Mock)
      .mockRejectedValueOnce(new Error('unavailable'))
      .mockResolvedValueOnce(fonts);

    await expect(listAvailableFonts()).rejects.toThrow('unavailable');
    await expect(listAvailableFonts()).resolves.toEqual(fonts);
    expect(figma.listAvailableFontsAsync).toHaveBeenCalledTimes(2);
  });
});
