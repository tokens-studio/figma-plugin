/**
 * Diagnostics utilities for Extended Variable Collections development.
 * These tools help with debugging and verification during implementation.
 */

import type { ThemeObject } from '@/types/ThemeObject';
import { getParentVariableCollectionId, getCollectionVariableIds } from './extendedCollectionHelpers';

export type ExtendedCollectionDiagnosticsPayload = {
  phase: string;
  collections: Array<{
    id: string;
    name: string;
    parentVariableCollectionId: string | null;
    modes: Array<{ name: string; modeId: string }>;
    variableIdsCount: number;
    variableOverridesSample?: Record<string, Record<string, unknown>>;
  }>;
  themes: Array<{
    id: string;
    name: string;
    group?: string;
    $extendsThemeId?: string;
    $figmaCollectionId?: string;
    $figmaParentCollectionId?: string;
    $figmaModeId?: string;
  }>;
  notes: string[];
};

/**
 * Checks if extended collection diagnostics are enabled.
 * Controlled via client storage flag.
 */
export async function isExtendedCollectionDiagnosticsEnabled(): Promise<boolean> {
  try {
    const debugSettings = await figma.clientStorage.getAsync('debugExtendedCollections');
    return debugSettings === true || debugSettings === 'true';
  } catch (e) {
    return false;
  }
}

/**
 * Logs extended collection diagnostics payload to the console.
 * Only logs if diagnostics are enabled.
 * 
 * @param phase - The implementation phase (e.g., "phase0", "phase1")
 * @param collections - Figma variable collections to include in diagnostics
 * @param themes - Theme objects to include in diagnostics
 * @param notes - Additional notes or observations
 */
export async function logExtendedCollectionDiagnostics(
  phase: string,
  collections: VariableCollection[],
  themes: ThemeObject[],
  notes: string[] = []
): Promise<void> {
  const enabled = await isExtendedCollectionDiagnosticsEnabled();
  if (!enabled) {
    return;
  }

  const payload: ExtendedCollectionDiagnosticsPayload = {
    phase,
    collections: collections.map((c) => {
      const variableIds = getCollectionVariableIds(c);
      const parentId = getParentVariableCollectionId(c);
      
      // Sample first 5 overrides if available
      let variableOverridesSample: Record<string, Record<string, unknown>> | undefined;
      if (c.variableOverrides && typeof c.variableOverrides === 'object') {
        const overrideKeys = Object.keys(c.variableOverrides).slice(0, 5);
        if (overrideKeys.length > 0) {
          variableOverridesSample = {};
          for (const key of overrideKeys) {
            variableOverridesSample[key] = c.variableOverrides[key];
          }
        }
      }

      return {
        id: c.id,
        name: c.name,
        parentVariableCollectionId: parentId || null,
        modes: c.modes.map((m) => ({ name: m.name, modeId: m.modeId })),
        variableIdsCount: variableIds.length,
        variableOverridesSample,
      };
    }),
    themes: themes.map((t) => ({
      id: t.id,
      name: t.name,
      group: t.group,
      $extendsThemeId: t.$extendsThemeId,
      $figmaCollectionId: t.$figmaCollectionId,
      $figmaParentCollectionId: t.$figmaParentCollectionId,
      $figmaModeId: t.$figmaModeId,
    })),
    notes,
  };

  console.log('TS_EXTCOLL_DIAGNOSTICS', JSON.stringify(payload, null, 2));
}

/**
 * Creates a minimal diagnostics snapshot of current state.
 * Useful for manual verification steps.
 */
export async function createDiagnosticsSnapshot(
  phase: string
): Promise<ExtendedCollectionDiagnosticsPayload | null> {
  const enabled = await isExtendedCollectionDiagnosticsEnabled();
  if (!enabled) {
    return null;
  }

  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    
    // For now, we don't have themes readily available here
    // This would need to be called from a context that has theme data
    const payload: ExtendedCollectionDiagnosticsPayload = {
      phase,
      collections: collections.map((c) => {
        const variableIds = getCollectionVariableIds(c);
        const parentId = getParentVariableCollectionId(c);

        return {
          id: c.id,
          name: c.name,
          parentVariableCollectionId: parentId || null,
          modes: c.modes.map((m) => ({ name: m.name, modeId: m.modeId })),
          variableIdsCount: variableIds.length,
        };
      }),
      themes: [],
      notes: ['Snapshot created without theme context'],
    };

    return payload;
  } catch (e) {
    console.error('Error creating diagnostics snapshot:', e);
    return null;
  }
}
