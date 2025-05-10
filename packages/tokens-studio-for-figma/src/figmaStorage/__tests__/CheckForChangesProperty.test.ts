import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { CheckForChangesProperty } from '../CheckForChangesProperty';

describe('CheckForChangesProperty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to write', async () => {
    // Mock metadata check for single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    await CheckForChangesProperty.write(true);

    // Should set metadata first (indicating single storage)
    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith(
      'tokens',
      'checkForChanges_meta',
      JSON.stringify({ type: 'single' }),
    );

    expect(mockRootSetSharedPluginData).toHaveBeenCalledWith('tokens', 'checkForChanges', 'true');
  });

  it('should be able to read', async () => {
    // Mock metadata indicating single storage
    mockRootGetSharedPluginData.mockReturnValueOnce(JSON.stringify({ type: 'single' }));

    // Mock the actual data
    mockRootGetSharedPluginData.mockReturnValueOnce('true');

    expect(await CheckForChangesProperty.read()).toBe(true);
  });

  it('should handle empty or invalid input when reading', async () => {
    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // No data found
    mockRootGetSharedPluginData.mockReturnValueOnce(undefined);
    const emptyResult = await CheckForChangesProperty.read();
    expect(emptyResult).toEqual(null);

    // Reset mocks
    jest.clearAllMocks();

    // No metadata found, fallback to direct read
    mockRootGetSharedPluginData.mockReturnValueOnce(null);

    // Null data found
    mockRootGetSharedPluginData.mockReturnValueOnce(null);
    const nullResult = await CheckForChangesProperty.read();
    expect(nullResult).toEqual(null);
  });
});
