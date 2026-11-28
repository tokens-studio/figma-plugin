import {
  buildSimpleCollections,
  describeSimpleViewRefusal,
  findCollectionByFolder,
  findModeBySetName,
  readThemesSimpleViewActive,
} from './simpleView';
import { RestApiError } from './restApi';
import type { StudioSimpleView } from '@/types/StudioSimpleView';

describe('readThemesSimpleViewActive', () => {
  it('reads the field from a JSON:API project response', () => {
    expect(readThemesSimpleViewActive({ data: { id: 'p', attributes: { themes_simple_view_active: true } } })).toBe(true);
    expect(readThemesSimpleViewActive({ id: 'p', attributes: { themes_simple_view_active: true } })).toBe(true);
    expect(readThemesSimpleViewActive({ id: 'p', themes_simple_view_active: true })).toBe(true);
  });

  it('reads a missing field, or anything but true, as not Simple', () => {
    expect(readThemesSimpleViewActive({ data: { id: 'p', attributes: { name: 'Northwind' } } })).toBe(false);
    expect(readThemesSimpleViewActive({ data: { id: 'p', attributes: { themes_simple_view_active: false } } })).toBe(false);
    expect(readThemesSimpleViewActive({ data: { id: 'p', attributes: { themes_simple_view_active: 'true' } } })).toBe(false);
    expect(readThemesSimpleViewActive(null)).toBe(false);
    expect(readThemesSimpleViewActive(undefined)).toBe(false);
  });
});

describe('buildSimpleCollections', () => {
  it('orders collections and modes, names each mode set and picks the effective default', () => {
    const groups = [
      { id: 'g-density', attributes: { name: 'Density', order_index: 1, effective_default_theme_option_id: 'o-compact' } },
      {
        id: 'g-color',
        attributes: {
          name: 'Color-mode', order_index: 0, default_theme_option_id: null, effective_default_theme_option_id: 'o-light',
        },
      },
    ];
    const options = [
      { id: 'o-dark', attributes: { name: 'Dark', order_index: 1, own_token_set_id: 's-dark' }, relationships: { theme_group: { data: { id: 'g-color' } } } },
      { id: 'o-light', attributes: { name: 'Light', order_index: 0, own_token_set_id: 's-light' }, relationships: { theme_group: { data: { id: 'g-color' } } } },
      { id: 'o-compact', attributes: { name: 'Compact', order_index: 0, own_token_set_id: 's-compact' }, relationships: { theme_group: { data: { id: 'g-density' } } } },
    ];
    const setNames = { 's-light': 'Color-mode/Light', 's-dark': 'Color-mode/Dark', 's-compact': 'Density/Compact' };

    expect(buildSimpleCollections(groups, options, setNames)).toEqual([
      {
        id: 'g-color',
        name: 'Color-mode',
        defaultModeId: 'o-light',
        modes: [
          {
            id: 'o-light', name: 'Light', tokenSetId: 's-light', tokenSetName: 'Color-mode/Light',
          },
          {
            id: 'o-dark', name: 'Dark', tokenSetId: 's-dark', tokenSetName: 'Color-mode/Dark',
          },
        ],
      },
      {
        id: 'g-density',
        name: 'Density',
        defaultModeId: 'o-compact',
        modes: [{
          id: 'o-compact', name: 'Compact', tokenSetId: 's-compact', tokenSetName: 'Density/Compact',
        }],
      },
    ]);
  });
});

describe('set tree lookups', () => {
  const view: StudioSimpleView = {
    projectId: 'p',
    active: true,
    collections: [{
      id: 'g',
      name: 'Color-mode',
      defaultModeId: 'light',
      modes: [
        { id: 'light', name: 'Light', tokenSetName: 'Color-mode/Light' },
        { id: 'dark', name: 'Dark', tokenSetName: 'Color-mode/Dark' },
      ],
    }],
  };

  it('finds the mode of a set and the collection of a folder', () => {
    expect(findModeBySetName(view, 'Color-mode/Dark')?.mode.id).toBe('dark');
    expect(findModeBySetName(view, 'Color-mode/Sepia')).toBeNull();
    expect(findCollectionByFolder(view, 'Color-mode')?.id).toBe('g');
    expect(findCollectionByFolder(view, 'Color')).toBeNull();
    expect(findModeBySetName(null, 'Color-mode/Dark')).toBeNull();
  });

  it('matches a nested collection by its own folder only, not by a parent folder', () => {
    const nested: StudioSimpleView = {
      projectId: 'p',
      active: true,
      collections: [
        { id: 'colors', name: 'Brand/Colors', modes: [{ id: 'c1', name: 'Light', tokenSetName: 'Brand/Colors/Light' }] },
        { id: 'type', name: 'Brand/Type', modes: [{ id: 't1', name: 'Default', tokenSetName: 'Brand/Type/Default' }] },
      ],
    };
    expect(findCollectionByFolder(nested, 'Brand')).toBeNull();
    expect(findCollectionByFolder(nested, 'Brand/Colors')?.id).toBe('colors');
    expect(findCollectionByFolder(nested, 'Brand/Type')?.id).toBe('type');
  });
});

describe('describeSimpleViewRefusal', () => {
  it('words each project_in_simple_mode rule in the plugin\'s terms and asks for a reload', () => {
    const refusal = describeSimpleViewRefusal(new RestApiError(
      422,
      'This project is in Simple view, where token sets follow collections and modes. Add a mode (POST theme_options with create_set) or a collection (POST theme_groups) instead.',
      'project_in_simple_mode',
      { rule: 'token_set_create' },
    ));
    expect(refusal).toEqual({
      message: 'This project uses Simple view in Tokens Studio, where sets follow collections and modes. Add a collection or a mode instead.',
      reload: true,
    });
    expect(refusal?.message).not.toContain('POST');
    expect(describeSimpleViewRefusal(new RestApiError(422, 'x', 'project_in_simple_mode', { rule: 'value_without_token' }))?.message)
      .toContain('default mode');
    expect(describeSimpleViewRefusal(new RestApiError(422, 'x', 'project_in_simple_mode', { rule: 'something_new' }))?.message)
      .toContain('Simple view');
  });

  it('reloads when the project changed view, but not for a mode that starts empty', () => {
    expect(describeSimpleViewRefusal(new RestApiError(422, 'x', 'simple_view_requires_create_set'))?.reload).toBe(true);
    expect(describeSimpleViewRefusal(new RestApiError(422, 'x', 'project_not_in_simple_view'))?.reload).toBe(true);
    expect(describeSimpleViewRefusal(new RestApiError(422, 'x', 'simple_view_required'))?.reload).toBe(true);
    expect(describeSimpleViewRefusal(new RestApiError(422, 'x', 'simple_view_mode_starts_empty'))).toEqual({
      message: expect.stringContaining('Copy values from'),
      reload: false,
    });
  });

  it('leaves every other error alone', () => {
    expect(describeSimpleViewRefusal(new RestApiError(422, 'Your plan includes 1 theme group.', 'theme_group_limit_reached'))).toBeNull();
    expect(describeSimpleViewRefusal(new RestApiError(422, 'A theme group with the name already exists'))).toBeNull();
    expect(describeSimpleViewRefusal(new Error('network'))).toBeNull();
  });
});
