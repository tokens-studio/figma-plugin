import {
  getParentPath,
  getTokenBaseName,
  isInGroup,
  buildTokenName,
  getPathDepth,
  areSiblings,
} from './tokenPath';

describe('tokenPath utilities', () => {
  describe('getParentPath', () => {
    it('should return parent path for nested token', () => {
      expect(getParentPath('size.font.small')).toBe('size.font');
    });

    it('should return parent path for double nested token', () => {
      expect(getParentPath('color.primary.light')).toBe('color.primary');
    });

    it('should return empty string for single-level token', () => {
      expect(getParentPath('size')).toBe('');
    });

    it('should return parent for two-level token', () => {
      expect(getParentPath('size.font')).toBe('size');
    });
  });

  describe('getTokenBaseName', () => {
    it('should return base name for nested token', () => {
      expect(getTokenBaseName('size.font.small')).toBe('small');
    });

    it('should return the token name itself for single-level token', () => {
      expect(getTokenBaseName('size')).toBe('size');
    });

    it('should return base name for two-level token', () => {
      expect(getTokenBaseName('size.font')).toBe('font');
    });
  });

  describe('isInGroup', () => {
    it('should return true if token is in the specified group', () => {
      expect(isInGroup('size.font.small', 'size.font')).toBe(true);
    });

    it('should return true if token is in a parent group', () => {
      expect(isInGroup('size.font.small', 'size')).toBe(true);
    });

    it('should return false if token is not in the specified group', () => {
      expect(isInGroup('size.font.small', 'color')).toBe(false);
    });

    it('should return true for empty group path (root level)', () => {
      expect(isInGroup('size.font.small', '')).toBe(true);
    });

    it('should return false if group path is just a prefix but not a parent', () => {
      expect(isInGroup('size.font.small', 'size.f')).toBe(false);
    });
  });

  describe('buildTokenName', () => {
    it('should build token name with parent path', () => {
      expect(buildTokenName('small', 'size.font')).toBe('size.font.small');
    });

    it('should return base name for empty parent path', () => {
      expect(buildTokenName('small', '')).toBe('small');
    });

    it('should build single-level nested token', () => {
      expect(buildTokenName('font', 'size')).toBe('size.font');
    });
  });

  describe('getPathDepth', () => {
    it('should return depth for nested token', () => {
      expect(getPathDepth('size.font.small')).toBe(3);
    });

    it('should return 1 for single-level token', () => {
      expect(getPathDepth('size')).toBe(1);
    });

    it('should return depth for two-level token', () => {
      expect(getPathDepth('size.font')).toBe(2);
    });
  });

  describe('areSiblings', () => {
    it('should return true for tokens in same parent group', () => {
      expect(areSiblings('size.font.small', 'size.font.big')).toBe(true);
    });

    it('should return false for tokens in different groups', () => {
      expect(areSiblings('size.font.small', 'size.spacing.small')).toBe(false);
    });

    it('should return true for root-level tokens', () => {
      expect(areSiblings('size', 'color')).toBe(true);
    });

    it('should return false when one is nested and one is root', () => {
      expect(areSiblings('size.font', 'color')).toBe(false);
    });
  });
});
