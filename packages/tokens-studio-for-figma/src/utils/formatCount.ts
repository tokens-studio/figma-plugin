/**
 * Format count to show "1k" for 1000 and "1.3k" for numbers over 1100
 * @param count The number to format
 * @returns Formatted string representation of the count
 */
export const formatCount = (count: number): string => {
  if (count >= 1000) {
    // For exact multiples of 1000, show without decimal
    if (count % 1000 === 0) {
      return `${count / 1000}k`;
    }
    // For numbers between 1000-1100, round down to 1k
    if (count < 1100) {
      return '1k';
    }
    // For other numbers, show with one decimal place
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};
