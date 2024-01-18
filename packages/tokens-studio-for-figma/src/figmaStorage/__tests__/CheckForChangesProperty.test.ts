import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { CheckForChangesProperty } from '../CheckForChangesProperty';

describe('CheckForChangesProperty', () => {
  it('should be able to write', async () => {
    await CheckForChangesProperty.write(true);
    expect(mockRootSetSharedPluginData).toBeCalledTimes(1);
    expect(mockRootSetSharedPluginData).toBeCalledWith('tokens', 'checkForChanges', 'true');
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce('true');
    expect(await CheckForChangesProperty.read()).toBe(true);
  });
});
