/**
 * Truncates names to fit Figma's constraints
 * @param name The name to truncate
 * @param maxLength Maximum allowed length (default: 40 for modes, 255 for collections)
 * @returns Truncated name with ellipsis if needed
 */
export function truncateName(name: string, maxLength: number = 40): string {
  if (name.length <= maxLength) {
    return name;
  }

  // Truncate and add ellipsis, ensuring we don't exceed maxLength
  return `${name.substring(0, maxLength - 3)}...`;
}

/**
 * Truncates mode names specifically (40 character limit)
 */
export function truncateModeName(name: string): string {
  return truncateName(name, 40);
}

/**
 * Truncates collection names specifically (255 character limit)
 */
export function truncateCollectionName(name: string): string {
  return truncateName(name, 255);
}
