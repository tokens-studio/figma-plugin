import { mockRootGetSharedPluginData, mockRootSetSharedPluginData } from '../../../tests/__mocks__/figmaMock';
import { CheckForChangesProperty } from '../CheckForChangesProperty';

describe('CheckForChangesProperty', () => {
  beforeEach(() => {
    mockRootSetSharedPluginData.mockClear();
    mockRootGetSharedPluginData.mockClear();
  });

  it('should be able to write', async () => {
    await CheckForChangesProperty.write(true);

    // Find the actual data write call
    const writeCall = mockRootSetSharedPluginData.mock.calls.find(
      (call) => call[1] === 'checkForChanges' && call[2] === 'true',
    );

    expect(writeCall).toBeTruthy();
    expect(writeCall).toEqual(['tokens', 'checkForChanges', 'true']);
  });

  it('should be able to read', async () => {
    mockRootGetSharedPluginData.mockReturnValueOnce('true');
    expect(await CheckForChangesProperty.read()).toBe(true);
  });
});
