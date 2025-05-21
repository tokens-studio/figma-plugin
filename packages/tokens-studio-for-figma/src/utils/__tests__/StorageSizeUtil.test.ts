import { StorageSizeUtil } from '../StorageSizeUtil';
import { compressToUTF16 } from 'lz-string';
import { getUTF16StringSize } from '../getUTF16StringSize';

// Mock lz-string and getUTF16StringSize
jest.mock('lz-string', () => ({
  compressToUTF16: jest.fn((input) => input), // Simple mock, returns input
}));
jest.mock('../getUTF16StringSize', () => ({
  getUTF16StringSize: jest.fn((input) => input.length * 2), // Simple mock
}));

// Mock figma.clientStorage
const mockClientStorageGet = jest.fn();
const mockClientStorageKeys = jest.fn();
global.figma = {
  clientStorage: {
    getAsync: mockClientStorageGet,
    keysAsync: mockClientStorageKeys,
  },
} as any;

describe('StorageSizeUtil', () => {
  beforeEach(() => {
    // Clear mock usage data before each test
    mockClientStorageGet.mockClear();
    mockClientStorageKeys.mockClear();
    (compressToUTF16 as jest.Mock).mockClear();
    (getUTF16StringSize as jest.Mock).mockClear();
  });

  describe('SAFE_STORAGE_LIMIT_BYTES', () => {
    it('should have the correct safe storage limit', () => {
      expect(StorageSizeUtil.SAFE_STORAGE_LIMIT_BYTES).toBe(4 * 1024 * 1024);
    });
  });

  describe('getObjectSize', () => {
    it('should return 0.0 for null input, considering compression and string size calculation', () => {
      // JSON.stringify(null) is 'null'
      // compressToUTF16 mock returns 'null'
      // getUTF16StringSize mock returns 'null'.length * 2 = 4 * 2 = 8 bytes
      // (8 / 1024) = 0.0078125, toFixed(1) gives 0.0
      expect(StorageSizeUtil.getObjectSize(null)).toBe(0.0);
      expect(compressToUTF16).toHaveBeenCalledWith('null');
      expect(getUTF16StringSize).toHaveBeenCalledWith('null');
    });

    it('should return 0.0 for undefined input as it results in a caught error', () => {
      // JSON.stringify(undefined) is undefined.
      // The try-catch in getObjectSize should handle this and return 0.
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(StorageSizeUtil.getObjectSize(undefined)).toBe(0.0);
      // Depending on how JSON.stringify behaves with undefined in the specific JS environment,
      // it might throw or return 'undefined'. If it throws, compressToUTF16 won't be called.
      // If it returns 'undefined', then those mocks would be called.
      // Given the code structure, it's safer to assume it might go into catch.
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to calculate object size:', expect.any(Error));
      consoleWarnSpy.mockRestore();
    });

    it('should calculate size for a simple object', () => {
      const obj = { a: 'b', c: 123 };
      const stringified = JSON.stringify(obj); // '{"a":"b","c":123}' (length 17)
      // compressToUTF16 mock returns input: '{"a":"b","c":123}'
      // getUTF16StringSize mock returns length * 2: 17 * 2 = 34 bytes
      // (34 / 1024) = 0.033203125, toFixed(1) gives '0.0'
      const expectedSizeInKB = Number(( (stringified.length * 2) / 1024).toFixed(1));
      expect(StorageSizeUtil.getObjectSize(obj)).toBe(expectedSizeInKB);
      expect(compressToUTF16).toHaveBeenCalledWith(stringified);
      expect(getUTF16StringSize).toHaveBeenCalledWith(stringified);
    });

    it('should calculate size for a complex object', () => {
      const obj = { a: 'b', c: { d: [1, 2, 'test'] } }; // '{"a":"b","c":{"d":[1,2,"test"]}}' (length 30)
      const stringified = JSON.stringify(obj);
      const expectedSizeInBytes = stringified.length * 2; // 30 * 2 = 60 bytes
      // (60 / 1024) = 0.05859375, toFixed(1) gives '0.1'
      const expectedSizeInKB = Number((expectedSizeInBytes / 1024).toFixed(1));
      expect(StorageSizeUtil.getObjectSize(obj)).toBe(expectedSizeInKB);
    });
    
    it('should return 0 and log warning on JSON.stringify error for circular objects', () => {
      const circularObj = {};
      circularObj.self = circularObj;
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(StorageSizeUtil.getObjectSize(circularObj)).toBe(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to calculate object size:', expect.any(TypeError));
      consoleWarnSpy.mockRestore();
    });
  });

  describe('getUsedStorageSize', () => {
    it('should return 0 if no keys are found', async () => {
      mockClientStorageKeys.mockResolvedValue([]);
      expect(await StorageSizeUtil.getUsedStorageSize()).toBe(0);
      expect(mockClientStorageKeys).toHaveBeenCalledTimes(1);
      expect(mockClientStorageGet).not.toHaveBeenCalled();
    });

    it('should filter keys and sum their sizes', async () => {
      mockClientStorageKeys.mockResolvedValue(['/tokens/set1', 'other/key', '/themes/main', '/tokens/set2']);
      // Data for /tokens/set1: 'datadata' (length 8) -> 8 * 2 = 16 bytes
      // Data for /themes/main: 'themedata' (length 9) -> 9 * 2 = 18 bytes
      // Data for /tokens/set2: 'tokendata' (length 9) -> 9 * 2 = 18 bytes
      // Total expected size = 16 + 18 + 18 = 52 bytes
      mockClientStorageGet
        .mockResolvedValueOnce('datadata') 
        .mockResolvedValueOnce('themedata') 
        .mockResolvedValueOnce('tokendata'); 

      expect(await StorageSizeUtil.getUsedStorageSize()).toBe(52);
      expect(mockClientStorageKeys).toHaveBeenCalledTimes(1);
      expect(mockClientStorageGet).toHaveBeenCalledTimes(3);
      expect(mockClientStorageGet).toHaveBeenCalledWith('/tokens/set1');
      expect(mockClientStorageGet).toHaveBeenCalledWith('/themes/main');
      expect(mockClientStorageGet).toHaveBeenCalledWith('/tokens/set2');
      // Check that getUTF16StringSize was called with the correct values by getUsedStorageSize
      expect(getUTF16StringSize).toHaveBeenCalledWith('datadata');
      expect(getUTF16StringSize).toHaveBeenCalledWith('themedata');
      expect(getUTF16StringSize).toHaveBeenCalledWith('tokendata');
    });

    it('should return 0 and log warning on clientStorage.keysAsync error', async () => {
      mockClientStorageKeys.mockRejectedValue(new Error('Storage key retrieval error'));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(await StorageSizeUtil.getUsedStorageSize()).toBe(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to get used storage size:', expect.any(Error));
      consoleWarnSpy.mockRestore();
    });
    
    it('should return 0 and log warning on clientStorage.getAsync error', async () => {
      mockClientStorageKeys.mockResolvedValue(['/tokens/set1']);
      mockClientStorageGet.mockRejectedValue(new Error('Storage item retrieval error'));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      // The loop will continue, but this specific item won't add to size.
      // If all items fail, or if it's a critical failure, it might return 0.
      // The current implementation catches the general error for the whole function.
      expect(await StorageSizeUtil.getUsedStorageSize()).toBe(0);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to get used storage size:', expect.any(Error));
      consoleWarnSpy.mockRestore();
    });

    it('should handle non-string values from clientStorage gracefully by not adding to size', async () => {
      mockClientStorageKeys.mockResolvedValue(['/tokens/item1', '/tokens/item2']);
      mockClientStorageGet
        .mockResolvedValueOnce({ notAString: true }) // Simulate non-string value
        .mockResolvedValueOnce('stringdata'); // length 10 -> 20 bytes
      // Should only count 'stringdata'
      expect(await StorageSizeUtil.getUsedStorageSize()).toBe(20); 
      expect(getUTF16StringSize).toHaveBeenCalledWith('stringdata');
      expect(getUTF16StringSize).not.toHaveBeenCalledWith({ notAString: true });
    });
  });
});
