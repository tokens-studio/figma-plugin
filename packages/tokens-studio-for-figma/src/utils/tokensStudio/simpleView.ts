import type { StudioSimpleCollection, StudioSimpleView } from '@/types/StudioSimpleView';
import { RestApiError } from './restApi';

/**
 * Studio's `themes_simple_view_active` from a project response (`GET /api/v1/projects/:id`, or one row of
 * `GET /api/v1/projects`). Studio sends the field only while its `themes_simple_view` flag is on for the
 * project, so anything but an explicit `true` means the project is not in Simple view.
 */
export function readThemesSimpleViewActive(project: unknown): boolean {
  if (!project || typeof project !== 'object') return false;
  const record = project as Record<string, any>;
  const source = record.data && typeof record.data === 'object' && !Array.isArray(record.data) ? record.data : record;
  const value = source.attributes?.themes_simple_view_active ?? source.themes_simple_view_active;
  return value === true;
}

type RawGroup = { id: string; attributes?: Record<string, any> };
type RawOption = { id: string; attributes?: Record<string, any>; relationships?: Record<string, any> };

const byOrderIndex = (a: { attributes?: Record<string, any> }, b: { attributes?: Record<string, any> }) => (
  Number(a.attributes?.order_index ?? 0) - Number(b.attributes?.order_index ?? 0)
);

/**
 * The collections and modes of a Simple view project, from the theme group and option lists Studio returns.
 * `tokenSetIdToName` maps a set id to its name, so each mode knows its own set in the plugin's tree.
 */
export function buildSimpleCollections(
  groups: RawGroup[],
  options: RawOption[],
  tokenSetIdToName: Record<string, string>,
): StudioSimpleCollection[] {
  return [...groups].sort(byOrderIndex).map((group) => {
    const modes = options
      .filter((option) => option.relationships?.theme_group?.data?.id === group.id)
      .sort(byOrderIndex)
      .map((option) => {
        const tokenSetId: string | undefined = option.attributes?.own_token_set_id || undefined;
        return {
          id: option.id,
          name: option.attributes?.name || option.id,
          ...(tokenSetId ? { tokenSetId } : {}),
          ...(tokenSetId && tokenSetIdToName[tokenSetId] ? { tokenSetName: tokenSetIdToName[tokenSetId] } : {}),
        };
      });
    const defaultModeId: string | undefined = group.attributes?.effective_default_theme_option_id
      || group.attributes?.default_theme_option_id
      || modes[0]?.id;
    return {
      id: group.id,
      name: group.attributes?.name || group.id,
      ...(defaultModeId ? { defaultModeId } : {}),
      modes,
    };
  });
}

/** The collection and mode whose own set is `tokenSetName`, if any. */
export function findModeBySetName(view: StudioSimpleView | null | undefined, tokenSetName: string) {
  if (!view) return null;
  for (const collection of view.collections) {
    const mode = collection.modes.find((m) => m.tokenSetName === tokenSetName);
    if (mode) return { collection, mode };
  }
  return null;
}

/** The collection a folder of the set tree stands for: its sets are that collection's mode sets. */
export function findCollectionByFolder(view: StudioSimpleView | null | undefined, folderPath: string) {
  if (!view) return null;
  return view.collections.find((collection) => (
    collection.modes.length > 0
    && collection.modes.every((mode) => mode.tokenSetName?.startsWith(`${folderPath}/`))
  )) ?? null;
}

// The refusal codes Studio answers a Simple view project with. See Studio's Themes::SimpleWriteRules.
export const SIMPLE_VIEW_REFUSAL_CODES = [
  'project_in_simple_mode',
  'simple_view_requires_create_set',
  'simple_view_mode_starts_empty',
  'project_not_in_simple_view',
  'simple_view_required',
] as const;

const IN_SIMPLE_VIEW = 'This project uses Simple view in Tokens Studio';

// One sentence per rule of Studio's `project_in_simple_mode` refusal (its `meta.rule`), in the plugin's words.
const RULE_MESSAGES: Record<string, string> = {
  token_set_create: `${IN_SIMPLE_VIEW}, where sets follow collections and modes. Add a collection or a mode instead.`,
  token_set_rename: `${IN_SIMPLE_VIEW}, where a set is named after its collection and mode. Rename the collection or the mode instead.`,
  token_set_reorder: `${IN_SIMPLE_VIEW}, where sets follow the order of their collections, so the new order wasn't saved.`,
  token_set_delete: `${IN_SIMPLE_VIEW}, where a set belongs to its mode. Delete the mode or the collection in Manage themes instead.`,
  theme_option_selection: `${IN_SIMPLE_VIEW}, which picks each mode's sets itself. Choose a default mode or copy values between modes instead.`,
  theme_option_create: `${IN_SIMPLE_VIEW}, where a new mode comes with its own set. Add the mode in Manage themes.`,
  theme_group_create: `${IN_SIMPLE_VIEW}. Add the collection in Manage themes.`,
  theme_delete: `${IN_SIMPLE_VIEW}. Delete the mode or the collection in Manage themes.`,
  token_move: `${IN_SIMPLE_VIEW}, where a token stays in its collection. Create it in the other collection and delete it here instead.`,
  value_without_token: `${IN_SIMPLE_VIEW}, where every token exists in its collection's default mode. Create the token in the default mode first; the other modes then show its value until you set their own.`,
};

/** The plugin's sentence for a Simple view rule (Studio's `meta.rule`), for refusing before Studio is asked. */
export function simpleViewRuleMessage(rule: keyof typeof RULE_MESSAGES | string): string {
  return RULE_MESSAGES[rule] ?? `${IN_SIMPLE_VIEW}, which doesn't allow this change.`;
}

export type SimpleViewRefusal = {
  /** What to tell the user. */
  message: string;
  /** The plugin's copy of the project no longer matches Studio, so pull it again. */
  reload: boolean;
};

/** The plugin's own wording for a Simple view refusal from Studio; null for any other error. */
export function describeSimpleViewRefusal(error: unknown): SimpleViewRefusal | null {
  if (!(error instanceof RestApiError) || !error.code) return null;
  switch (error.code) {
    case 'project_in_simple_mode': {
      const rule = typeof error.meta?.rule === 'string' ? error.meta.rule : '';
      return {
        message: simpleViewRuleMessage(rule),
        reload: true,
      };
    }
    case 'simple_view_requires_create_set':
      return {
        message: `${IN_SIMPLE_VIEW} now, where a mode comes with its own set. The project was reloaded: add the mode again in Manage themes.`,
        reload: true,
      };
    case 'simple_view_mode_starts_empty':
      return {
        message: 'A new mode starts empty and shows the default mode\'s values. Use "Copy values from" to copy another mode.',
        reload: false,
      };
    case 'project_not_in_simple_view':
    case 'simple_view_required':
      return {
        message: 'This project no longer uses Simple view in Tokens Studio. The project was reloaded: try again.',
        reload: true,
      };
    default:
      return null;
  }
}
