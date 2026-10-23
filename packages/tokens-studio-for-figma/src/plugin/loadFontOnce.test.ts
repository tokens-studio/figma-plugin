import { mockLoadFontAsync } from '../../tests/__mocks__/figmaMock';
import { clearFontLoadCache, loadFontOnce } from './loadFontOnce';

describe('loadFontOnce', () => {
  beforeEach(() => {
    clearFontLoadCache();
    mockLoadFontAsync.mockReset();
    mockLoadFontAsync.mockResolvedValue(undefined);
  });

  it('shares a pending load and reuses it for the same font', async () => {
    const font = { family: 'Inter', style: 'Regular' };

    await Promise.all([loadFontOnce(font), loadFontOnce(font)]);
    await loadFontOnce(font);
    await loadFontOnce({ family: 'Inter', style: 'Bold' });

    expect(mockLoadFontAsync).toHaveBeenCalledTimes(2);
  });

  it('retries failed font loads', async () => {
    const font = { family: 'Inter', style: 'Regular' };
    mockLoadFontAsync.mockRejectedValueOnce(new Error('Missing font'));

    await expect(loadFontOnce(font)).rejects.toThrow('Missing font');
    await expect(loadFontOnce(font)).resolves.toBeUndefined();

    expect(mockLoadFontAsync).toHaveBeenCalledTimes(2);
  });

  it('does not evict a newer load when an old one fails after a cache reset', async () => {
    const font = { family: 'Inter', style: 'Regular' };
    let rejectOldLoad: (error: Error) => void = () => {};
    mockLoadFontAsync.mockImplementationOnce(() => new Promise<void>((_, reject) => {
      rejectOldLoad = reject;
    }));
    const oldLoad = loadFontOnce(font);
    await Promise.resolve();

    clearFontLoadCache();
    const newLoad = loadFontOnce(font);
    rejectOldLoad(new Error('Old load failed'));
    await expect(oldLoad).rejects.toThrow('Old load failed');
    await newLoad;
    await loadFontOnce(font);

    expect(mockLoadFontAsync).toHaveBeenCalledTimes(2);
  });
});
