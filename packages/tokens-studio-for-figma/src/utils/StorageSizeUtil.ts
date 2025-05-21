import { compressToUTF16 } from 'lz-string';
import { getUTF16StringSize } from './getUTF16StringSize';

/**
 * Utility class for checking storage sizes.
 * Provides methods to calculate the size of objects and the total used storage in Figma's clientStorage.
 */
export class StorageSizeUtil {
    /**
     * A safe storage limit in bytes (4MB).
     * This can be used to warn users before they reach Figma's hard limit for clientStorage (5MB).
     */
    public static SAFE_STORAGE_LIMIT_BYTES: number = 4 * 1024 * 1024;

    /**
     * Calculates the approximate size of a JavaScript object after JSON stringification and UTF-16 compression.
     * @param data The object to calculate the size for.
     * @returns The estimated size of the data in kilobytes (KB), rounded to one decimal place.
     * Returns 0 if size calculation fails.
     */
    public static getObjectSize(data: any): number {
        try {
            const stringifiedData = JSON.stringify(data);
            // If stringify returns undefined (e.g. for undefined input), it can cause issues.
            // However, compressToUTF16 and getUTF16StringSize might handle this, or it results in small/zero size.
            // For robustness, ensure stringifiedData is actually a string.
            if (typeof stringifiedData !== 'string') {
                // This case might occur if JSON.stringify returns undefined directly.
                // console.warn('Stringification resulted in a non-string value.'); // Optional: for debugging
                return 0;
            }
            const compressedData = compressToUTF16(stringifiedData);
            const sizeInBytes = getUTF16StringSize(compressedData);
            return Number((sizeInBytes / 1024).toFixed(1));
        } catch (e) {
            console.warn('Failed to calculate object size:', e);
            return 0;
        }
    }

    /**
     * Calculates the total storage size currently used by specific keys in Figma's clientStorage.
     * It filters for keys containing '/tokens/' or '/themes/' and sums their sizes.
     * @returns A Promise that resolves to the total used storage size in bytes.
     * Returns 0 if the calculation fails or no relevant keys are found.
     */
    public static async getUsedStorageSize(): Promise<number> {
        try {
            const keys = await figma.clientStorage.keysAsync();
            const storageKeys = keys.filter((key) => key.includes('/tokens/') || key.includes('/themes/'));
            let totalSize = 0;
            for (const key of storageKeys) {
                const value = await figma.clientStorage.getAsync(key);
                if (typeof value === 'string') {
                    // Assuming values are strings; Figma clientStorage stores strings.
                    // If values could be something else that needs different size calculation, this needs adjustment.
                    totalSize += getUTF16StringSize(value);
                }
            }
            return totalSize;
        } catch (e) {
            console.warn('Failed to get used storage size:', e);
            return 0;
        }
    }
}
