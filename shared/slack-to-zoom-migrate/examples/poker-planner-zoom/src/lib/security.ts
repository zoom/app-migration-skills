/**
 * Security utility functions
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * CRITICAL: Always use this when injecting user-controlled or config data into HTML
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
