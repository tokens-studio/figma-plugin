import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { CheckForChangesProperty } from '../CheckForChangesProperty';

describe('CheckForChangesProperty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRootGetSharedPluginData.mockReset();
  });

  it('should be able to write', async () => {
    mockRootGetSharedPluginData.mockImplementation(() => null);

    await CheckForChangesProperty.write(true);

    expect(mockRootSetSharedPluginData).toBeCalledWith('tokens', 'checkForChanges', 'true');
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockImplementation(() => 'true');

    expect(await CheckForChangesProperty.read()).toBe(true);
  });

  it('should handle empty or invalid input when reading', async () => {
    mockRootGetSharedPluginData.mockReturnValue(null);

    const emptyResult = await CheckForChangesProperty.read();
    expect(emptyResult).toBe(null);
  });
});
