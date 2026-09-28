import { ThemeObject } from '@/types';

/**
 * Cycle-safe traversal helpers for the $figmaParentThemeId hierarchy.
 *
 * $figmaParentThemeId round-trips through remote sync and hand-editable JSON,
 * so a self-reference or an a→b→a cycle is possible. Every walk over the
 * hierarchy must be guarded or the plugin hard-freezes.
 */

/** Walk up the parent chain from themeId (exclusive), stopping on cycles. */
export function collectAncestors(themeId: string, parentByThemeId: Map<string, string>): string[] {
  const ancestors: string[] = [];
  const visited = new Set<string>([themeId]);
  let current = parentByThemeId.get(themeId);
  while (current && !visited.has(current)) {
    visited.add(current);
    ancestors.push(current);
    current = parentByThemeId.get(current);
  }
  return ancestors;
}

/** Collect all descendants of themeId (exclusive), stopping on cycles. */
export function collectDescendants(themeId: string, childrenByThemeId: Map<string, string[]>): string[] {
  const descendants: string[] = [];
  const visited = new Set<string>([themeId]);
  const queue = [...(childrenByThemeId.get(themeId) ?? [])];
  while (queue.length > 0) {
    const next = queue.shift()!;
    if (!visited.has(next)) {
      visited.add(next);
      descendants.push(next);
      queue.push(...(childrenByThemeId.get(next) ?? []));
    }
  }
  return descendants;
}

/** Depth of a theme in the hierarchy (0 = no parent), cycle-safe. */
export function getThemeDepth(themeId: string, themesById: Map<string, ThemeObject>): number {
  return collectAncestors(
    themeId,
    new Map(
      Array.from(themesById.values())
        .filter((t) => t.$figmaParentThemeId && themesById.has(t.$figmaParentThemeId))
        .map((t) => [t.id, t.$figmaParentThemeId!]),
    ),
  ).length;
}

/** Build a themeId → parentThemeId map from a theme list. */
export function buildParentMap(themes: ThemeObject[]): Map<string, string> {
  const map = new Map<string, string>();
  themes.forEach((t) => {
    if (t.$figmaParentThemeId) map.set(t.id, t.$figmaParentThemeId);
  });
  return map;
}

/** Build a themeId → children ids map from a theme list. */
export function buildChildrenMap(themes: ThemeObject[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  themes.forEach((t) => {
    if (t.$figmaParentThemeId) {
      const list = map.get(t.$figmaParentThemeId) ?? [];
      list.push(t.id);
      map.set(t.$figmaParentThemeId, list);
    }
  });
  return map;
}
