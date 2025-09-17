import { autoApplyThemeOnDropSelector } from '../autoApplyThemeOnDropSelector';
import { RootState } from '@/app/store';

describe('autoApplyThemeOnDropSelector', () => {
  it('should return false when autoApplyThemeOnDrop is undefined', () => {
    const state = {
      settings: {},
    } as RootState;

    const result = autoApplyThemeOnDropSelector(state);
    expect(result).toBe(false);
  });

  it('should return false when autoApplyThemeOnDrop is false', () => {
    const state = {
      settings: {
        autoApplyThemeOnDrop: false,
      },
    } as RootState;

    const result = autoApplyThemeOnDropSelector(state);
    expect(result).toBe(false);
  });

  it('should return true when autoApplyThemeOnDrop is true', () => {
    const state = {
      settings: {
        autoApplyThemeOnDrop: true,
      },
    } as RootState;

    const result = autoApplyThemeOnDropSelector(state);
    expect(result).toBe(true);
  });
});
