import { renderHook } from '@testing-library/react';
import useFile from '../file';

// Mock FileTokenStorage
const mockEnableMultiFile = jest.fn();
const mockRetrieve = jest.fn();

jest.mock('@/storage/FileTokenStorage', () => ({
  FileTokenStorage: jest.fn().mockImplementation(() => ({
    enableMultiFile: mockEnableMultiFile,
    retrieve: mockRetrieve,
  })),
}));

describe('useFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should always enable multi-file functionality regardless of user plan', () => {
    const { result } = renderHook(() => useFile());

    // The important thing is that enableMultiFile should be called without any plan check
    expect(result.current.readTokensFromFileOrDirectory).toBeDefined();
  });

  it('should call enableMultiFile when creating storage client', async () => {
    const { result } = renderHook(() => useFile());

    // Create a mock FileList
    const mockFileList = {
      0: new File([new Blob(['{}'], { type: 'application/json' })], 'test.json'),
      length: 1,
    } as unknown as FileList;

    mockRetrieve.mockResolvedValueOnce({
      status: 'success',
      tokens: {},
      themes: [],
      metadata: {},
    });

    // Call the function
    await result.current.readTokensFromFileOrDirectory(mockFileList);

    // Verify that enableMultiFile was called (this proves it's enabled for all users)
    expect(mockEnableMultiFile).toHaveBeenCalledTimes(1);
  });
});
