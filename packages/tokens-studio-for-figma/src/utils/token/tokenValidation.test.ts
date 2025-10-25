import { TokenTypes } from '@/constants/TokenTypes';
import { SingleToken } from '@/types/tokens';
import { wouldCauseNameCollision, getNewTokenName } from './tokenValidation';

describe('tokenValidation utilities', () => {
  const createToken = (name: string): SingleToken => ({
    name,
    type: TokenTypes.SIZING,
    value: '10',
  });

  describe('wouldCauseNameCollision', () => {
    it('should return false when moving to same parent', () => {
      const token = createToken('size.font.small');
      const allTokens = [
        createToken('size.font.small'),
        createToken('size.font.big'),
      ];

      expect(wouldCauseNameCollision(token, 'size.font', allTokens)).toBe(false);
    });

    it('should return true when target location has existing token with same base name', () => {
      const token = createToken('size.font.small');
      const allTokens = [
        createToken('size.font.small'),
        createToken('size.spacing.small'), // This would collide if we move to size.spacing
      ];

      expect(wouldCauseNameCollision(token, 'size.spacing', allTokens)).toBe(true);
    });

    it('should return false when target location is available', () => {
      const token = createToken('size.font.small');
      const allTokens = [
        createToken('size.font.small'),
        createToken('size.spacing.big'),
      ];

      expect(wouldCauseNameCollision(token, 'size.spacing', allTokens)).toBe(false);
    });

    it('should return false when moving to root level and name is available', () => {
      const token = createToken('size.font.small');
      const allTokens = [
        createToken('size.font.small'),
        createToken('big'),
      ];

      expect(wouldCauseNameCollision(token, '', allTokens)).toBe(false);
    });

    it('should return true when moving to root level and name exists', () => {
      const token = createToken('size.font.small');
      const allTokens = [
        createToken('size.font.small'),
        createToken('small'), // This would collide
      ];

      expect(wouldCauseNameCollision(token, '', allTokens)).toBe(true);
    });
  });

  describe('getNewTokenName', () => {
    it('should build new name with new parent', () => {
      const token = createToken('size.font.small');
      expect(getNewTokenName(token, 'size.spacing')).toBe('size.spacing.small');
    });

    it('should return base name when moving to root', () => {
      const token = createToken('size.font.small');
      expect(getNewTokenName(token, '')).toBe('small');
    });

    it('should handle single-level token moving to group', () => {
      const token = createToken('small');
      expect(getNewTokenName(token, 'size.font')).toBe('size.font.small');
    });
  });
});
