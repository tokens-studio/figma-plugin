import { store } from '@/app/store';
import { notifyToUI } from '@/plugin/notifiers';
import { getStudioSimpleView } from '@/selectors/studioSimpleViewSelector';
import { RestApiError } from '@/utils/tokensStudio/restApi';
import { describeSimpleViewRefusal } from '@/utils/tokensStudio/simpleView';
import type { StudioSimpleCollection, StudioSimpleMode } from '@/types/StudioSimpleView';
import { pushToTokensStudioOAuth, reloadStudioProject } from './tokensStudioOAuth';

// Theme management in a Tokens Studio project in Simple view (Studio ADR-182). Studio creates, renames,
// deletes and orders each collection's and mode's token sets itself, so every write is followed by a pull
// that brings the plugin's sets, themes and selections in line.

function failureReason(error: unknown): string {
  const refusal = describeSimpleViewRefusal(error);
  if (refusal) return refusal.message;
  if (error instanceof RestApiError && error.detail) return error.detail;
  return error instanceof Error ? error.message : 'Unknown error';
}

async function runSteps(
  steps: Array<{ action: string; data: Record<string, unknown> }>,
  { success, failure }: { success: string | ((results: any[]) => string); failure: string },
  context: any,
): Promise<boolean> {
  const results: any[] = [];
  try {
    for (const step of steps) {
      // eslint-disable-next-line no-await-in-loop
      const result = await pushToTokensStudioOAuth({
        context,
        action: step.action,
        data: step.data,
        rethrowErrors: true,
        notifyOnSuccess: false,
      });
      // Null without an error: no access token or no change set for the branch, already reported.
      if (!result) return false;
      results.push(result);
    }
  } catch (error) {
    notifyToUI(`${failure}: ${failureReason(error)}`, { error: true });
    // A refused write may follow a step that went through, or the plugin's copy may be stale.
    await reloadStudioProject();
    return false;
  }
  notifyToUI(typeof success === 'function' ? success(results) : success);
  await reloadStudioProject();
  return true;
}

// Writes still running, with the pull after each. The UI disables Simple view actions until it is 0.
let pendingWrites = 0;

async function runSimpleWrite(
  steps: Array<{ action: string; data: Record<string, unknown> }>,
  { success, failure }: { success: string | ((results: any[]) => string); failure: string },
): Promise<boolean> {
  const state = store.getState();
  // Only for a project in Simple view: every other project keeps the plugin's usual flows.
  if (!getStudioSimpleView(state)) return false;
  const context = state.uiState.api as any;
  pendingWrites += 1;
  store.dispatch.tokenState.setStudioSimpleWritePending(true);
  try {
    return await runSteps(steps, { success, failure }, context);
  } finally {
    pendingWrites -= 1;
    if (pendingWrites === 0) store.dispatch.tokenState.setStudioSimpleWritePending(false);
  }
}

export function addSimpleCollection(name: string) {
  return runSimpleWrite(
    [{ action: 'SIMPLE_CREATE_COLLECTION', data: { name } }],
    { success: `Added collection "${name}" to Tokens Studio`, failure: `Couldn't add collection "${name}"` },
  );
}

export function renameSimpleCollection(collection: StudioSimpleCollection, name: string) {
  return runSimpleWrite(
    [{ action: 'UPDATE_THEME_GROUP', data: { id: collection.id, name } }],
    { success: `Renamed collection "${collection.name}" to "${name}"`, failure: `Couldn't rename collection "${collection.name}"` },
  );
}

export function deleteSimpleCollection(collection: StudioSimpleCollection) {
  return runSimpleWrite(
    [{ action: 'DELETE_THEME_GROUP', data: { id: collection.id } }],
    { success: `Deleted collection "${collection.name}"`, failure: `Couldn't delete collection "${collection.name}"` },
  );
}

export function addSimpleMode(collection: StudioSimpleCollection, name: string) {
  return runSimpleWrite(
    [{ action: 'SIMPLE_CREATE_MODE', data: { collectionId: collection.id, name } }],
    { success: `Added mode "${name}" to "${collection.name}"`, failure: `Couldn't add mode "${name}"` },
  );
}

export function renameSimpleMode(mode: StudioSimpleMode, name: string) {
  return runSimpleWrite(
    [{ action: 'UPDATE_THEME', data: { id: mode.id, name } }],
    { success: `Renamed mode "${mode.name}" to "${name}"`, failure: `Couldn't rename mode "${mode.name}"` },
  );
}

export function deleteSimpleMode(mode: StudioSimpleMode) {
  return runSimpleWrite(
    [{ action: 'DELETE_THEME', data: { id: mode.id } }],
    { success: `Deleted mode "${mode.name}"`, failure: `Couldn't delete mode "${mode.name}"` },
  );
}

export function setSimpleDefaultMode(collection: StudioSimpleCollection, mode: StudioSimpleMode) {
  return runSimpleWrite(
    [{ action: 'SIMPLE_SET_DEFAULT_MODE', data: { collectionId: collection.id, modeId: mode.id } }],
    { success: `"${mode.name}" is now the default mode of "${collection.name}"`, failure: `Couldn't make "${mode.name}" the default mode` },
  );
}

/**
 * The first mode is the default mode. Until Studio makes "move to first" set the default itself, a new first
 * mode is also set as the default explicitly.
 */
export function reorderSimpleModes(collection: StudioSimpleCollection, orderedModeIds: string[]) {
  const steps: Array<{ action: string; data: Record<string, unknown> }> = [
    { action: 'SIMPLE_REORDER_MODES', data: { collectionId: collection.id, orderedIds: orderedModeIds } },
  ];
  const first = orderedModeIds[0];
  if (first && first !== collection.defaultModeId) {
    steps.push({ action: 'SIMPLE_SET_DEFAULT_MODE', data: { collectionId: collection.id, modeId: first } });
  }
  return runSimpleWrite(steps, {
    success: `Reordered the modes of "${collection.name}"`,
    failure: `Couldn't reorder the modes of "${collection.name}"`,
  });
}

export function copySimpleModeValues(into: StudioSimpleMode, from: StudioSimpleMode) {
  return runSimpleWrite(
    [{ action: 'SIMPLE_COPY_MODE_VALUES', data: { modeId: into.id, fromModeId: from.id } }],
    {
      success: (results) => {
        const count = results[0]?.data?.written_count;
        return typeof count === 'number'
          ? `Copied ${count} ${count === 1 ? 'value' : 'values'} from "${from.name}" to "${into.name}"`
          : `Copied the values of "${from.name}" to "${into.name}"`;
      },
      failure: `Couldn't copy the values of "${from.name}"`,
    },
  );
}
