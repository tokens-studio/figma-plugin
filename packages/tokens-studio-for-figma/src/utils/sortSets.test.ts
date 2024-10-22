import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { UsedTokenSetsMap } from '@/types';
import { sortSets } from './sortSets';

describe('sortSets', () => {
  const config: UsedTokenSetsMap = {
    source: TokenSetStatus.SOURCE,
    enabled: TokenSetStatus.ENABLED,
    disabled: TokenSetStatus.DISABLED,
  };

  it('should prioritize DISABLED over ENABLED and SOURCE', () => {
    expect(sortSets('disabled', 'enabled', config)).toBe(-1);
    expect(sortSets('enabled', 'disabled', config)).toBe(1);
    expect(sortSets('disabled', 'source', config)).toBe(-1);
    expect(sortSets('source', 'disabled', config)).toBe(1);
  });

  it('should maintain order for same status', () => {
    expect(sortSets('source', 'source', config)).toBe(0);
    expect(sortSets('enabled', 'enabled', config)).toBe(0);
    expect(sortSets('disabled', 'disabled', config)).toBe(0);
  });

  it('should handle sets not in config', () => {
    expect(sortSets('unknown1', 'unknown2', config)).toBe(0);
    expect(sortSets('disabled', 'unknown', config)).toBe(0); // DISABLED is treated as DISABLED
    expect(sortSets('unknown', 'disabled', config)).toBe(0); // DISABLED is treated as DISABLED
    expect(sortSets('unknown', 'enabled', config)).toBe(-1);
    expect(sortSets('enabled', 'unknown', config)).toBe(1);
    expect(sortSets('unknown', 'source', config)).toBe(-1);
    expect(sortSets('source', 'unknown', config)).toBe(1);
  });

  it('should not prioritize between ENABLED and SOURCE', () => {
    expect(sortSets('enabled', 'source', config)).toBe(0);
    expect(sortSets('source', 'enabled', config)).toBe(0);
  });
});
