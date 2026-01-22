import { autoSelectFirstThemesPerGroup, ThemeOption, ActiveTheme } from '../autoSelectThemes';

describe('autoSelectFirstThemesPerGroup', () => {
  const mockThemes: ThemeOption[] = [
    { value: 'light', label: 'Light', group: 'mode' },
    { value: 'dark', label: 'Dark', group: 'mode' },
    { value: 'desktop', label: 'Desktop', group: 'size' },
    { value: 'mobile', label: 'Mobile', group: 'size' },
    { value: 'brand-a', label: 'Brand A', group: 'brand' },
    { value: 'no-group-1', label: 'No Group 1' }, // no group property
    { value: 'no-group-2', label: 'No Group 2' }, // no group property
  ];

  it('should return empty object when no themes are provided', () => {
    const result = autoSelectFirstThemesPerGroup([], {});
    expect(result).toEqual({});
  });

  it('should auto-select first theme from each group when no active themes exist', () => {
    const result = autoSelectFirstThemesPerGroup(mockThemes, {});

    expect(result).toEqual({
      mode: 'light',
      size: 'desktop',
      brand: 'brand-a',
      internal_themes_no_group: 'no-group-1',
    });
  });

  it('should return existing active themes without changes when themes already exist', () => {
    const existingActiveTheme: ActiveTheme = {
      mode: 'dark',
      size: 'mobile',
    };

    const result = autoSelectFirstThemesPerGroup(mockThemes, existingActiveTheme);

    expect(result).toEqual(existingActiveTheme);
  });

  it('should handle themes with only ungrouped themes', () => {
    const ungroupedThemes: ThemeOption[] = [
      { value: 'theme1', label: 'Theme 1' },
      { value: 'theme2', label: 'Theme 2' },
    ];

    const result = autoSelectFirstThemesPerGroup(ungroupedThemes, {});

    expect(result).toEqual({
      internal_themes_no_group: 'theme1',
    });
  });

  it('should handle themes with only one group', () => {
    const singleGroupThemes: ThemeOption[] = [
      { value: 'light', label: 'Light', group: 'mode' },
      { value: 'dark', label: 'Dark', group: 'mode' },
    ];

    const result = autoSelectFirstThemesPerGroup(singleGroupThemes, {});

    expect(result).toEqual({
      mode: 'light',
    });
  });

  it('should preserve existing theme selection even with partial coverage', () => {
    const partialActiveTheme: ActiveTheme = {
      mode: 'dark',
      // missing size and brand selections
    };

    const result = autoSelectFirstThemesPerGroup(mockThemes, partialActiveTheme);

    // Should return the existing selection unchanged
    expect(result).toEqual(partialActiveTheme);
  });
});
