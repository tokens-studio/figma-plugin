/**
 * Check if two colors are approximately equal within a threshold
 * @param color1 First color to compare
 * @param color2 Second color to compare
 * @param threshold Threshold for comparison (default: 0.0001)
 * @returns true if colors are approximately equal
 */
export function isColorApproximatelyEqual(
  color1: { r: number; g: number; b: number; a: number },
  color2: { r: number; g: number; b: number; a: number },
  threshold: number = 0.0001,
): boolean {
  return (
    Math.abs(color1.r - color2.r) < threshold
    && Math.abs(color1.g - color2.g) < threshold
    && Math.abs(color1.b - color2.b) < threshold
    && Math.abs(color1.a - color2.a) < threshold
  );
}
