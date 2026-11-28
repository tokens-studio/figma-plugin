// Tokens Studio "Simple view" (Studio ADR-182): the project shows collections (theme groups) and their
// modes (theme options), and Studio owns the token sets behind them. Every mode has exactly one set,
// named `<Collection>/<Mode>`.

export type StudioSimpleMode = {
  id: string;
  name: string;
  /** The mode's own token set (Studio's `own_token_set_id`). */
  tokenSetId?: string;
  /** That set's name, as the plugin's token set tree shows it. */
  tokenSetName?: string;
};

export type StudioSimpleCollection = {
  id: string;
  name: string;
  /** The mode that acts as the default (Studio's `effective_default_theme_option_id`). */
  defaultModeId?: string;
  /** In Studio's order. */
  modes: StudioSimpleMode[];
};

export type StudioSimpleView = {
  /** The project this was read for, so a switch to another project can't inherit it. */
  projectId: string;
  /** Studio's `themes_simple_view_active`. A missing field reads as false. */
  active: boolean;
  /** In Studio's order. */
  collections: StudioSimpleCollection[];
};
