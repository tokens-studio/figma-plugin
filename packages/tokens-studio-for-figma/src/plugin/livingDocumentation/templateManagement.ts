import { createTokenTemplate } from './frameUtils';

// Cache for template placeholders to avoid repeated DOM queries
const templatePlaceholdersCache = new Map<any, Array<{ node: any; prop: string }>>();

// Cache for templates by token type
const templateCache = new Map<string, any>();

/**
 * Get all unique token types from the tokens by set
 */
export function getAllTokenTypes(tokensBySet: Record<string, any[]>): Set<string> {
  const allTokenTypes = new Set<string>();
  for (const tokens of Object.values(tokensBySet)) {
    for (const token of tokens) {
      allTokenTypes.add(token.type);
    }
  }
  return allTokenTypes;
}

/**
 * Initialize templates - either use user template or create type-specific templates
 */
export async function initializeTemplates(
  tokensBySet: Record<string, any[]>,
  userTemplate?: any,
): Promise<void> {
  // Clear caches at the beginning to ensure fresh start
  templatePlaceholdersCache.clear();
  templateCache.clear();

  const allTokenTypes = getAllTokenTypes(tokensBySet);

  if (userTemplate) {
    // Use user template for all token types
    for (const tokenType of allTokenTypes) {
      templateCache.set(tokenType, userTemplate);
    }
  } else {
    // Create type-specific templates for all token types
    for (const tokenType of allTokenTypes) {
      if (!templateCache.has(tokenType)) {
        const template = await createTokenTemplate(tokenType as any);
        templateCache.set(tokenType, template);
      }
    }
  }
}

/**
 * Clean up templates from document (but not user template)
 */
export function cleanupTemplates(userTemplate?: any): void {
  // Clear placeholder cache
  templatePlaceholdersCache.clear();

  // Clean up templates from document (but not user template)
  for (const template of templateCache.values()) {
    if (template && template.parent && template !== userTemplate) {
      template.remove();
    }
  }
  templateCache.clear();
}

/**
 * Get cached template for a token type
 */
export function getTemplateForTokenType(tokenType: string): any {
  return templateCache.get(tokenType);
}

/**
 * Set template for a token type
 */
export function setTemplateForTokenType(tokenType: string, template: any): void {
  templateCache.set(tokenType, template);
}

/**
 * Get cached placeholders for a template
 */
export function getTemplatePlaceholders(template: any): Array<{ node: any; prop: string }> | undefined {
  return templatePlaceholdersCache.get(template);
}

/**
 * Set cached placeholders for a template
 */
export function setTemplatePlaceholders(template: any, placeholders: Array<{ node: any; prop: string }>): void {
  templatePlaceholdersCache.set(template, placeholders);
}
