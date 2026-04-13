import { TokenSetStatus } from '@/constants/TokenSetStatus';
import { normalizeTokenSetName, normalizeTokenSetStatusMap } from './normalizeTokenSetName';

describe('normalizeTokenSetName', () => {
  it('trims each segment around "/"', () => {
    expect(normalizeTokenSetName(' parent / child / leaf ')).toBe('parent/child/leaf');
  });
});

describe('normalizeTokenSetStatusMap', () => {
  it('merges duplicate normalized keys using status priority', () => {
    const normalizedMap = normalizeTokenSetStatusMap({
      'parent/child': TokenSetStatus.SOURCE,
      'parent / child': TokenSetStatus.ENABLED,
      'parent / child ': TokenSetStatus.DISABLED,
    });

    expect(normalizedMap).toEqual({
      'parent/child': TokenSetStatus.ENABLED,
    });
  });
});
