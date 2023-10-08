import { Properties } from '@/constants/Properties';
import { isDocumentationType } from '../isDocumentationType';

describe('isDocumentationType', () => {
  const documentationTypes = ['tokenValue', 'value', 'tokenName', 'description'];
  const nonDocumentationTypes = ['composition', 'sizing', 'opacity', 'color'];
  it('should return true for documentation types', () => {
    documentationTypes.forEach((type) => {
      expect(isDocumentationType(type as Properties)).toBe(true);
    });
  });

  it('should return false for non documentation types', () => {
    nonDocumentationTypes.forEach((type) => {
      expect(isDocumentationType(type as Properties)).toBe(false);
    });
  });
});
