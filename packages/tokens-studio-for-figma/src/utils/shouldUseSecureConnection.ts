/**
 * Utility functions for Tokens Studio connection configuration
 */

export function shouldUseSecureConnection(baseUrl?: string, host?: string): boolean {
  // Use HTTPS for production builds OR when connecting to external Studio instances
  return process.env.ENVIRONMENT !== 'development' || Boolean(baseUrl?.trim() && host && !host.includes('localhost'));
}
