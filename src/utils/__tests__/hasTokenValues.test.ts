import { TokenTypes } from '@/constants/TokenTypes';
import { hasTokenValues } from '../hasTokenValues';

describe('hasTokenValues', () => {
  it('should return true', () => {
    expect(hasTokenValues({
      global: [
        {
          name: 'colors.red',
          type: TokenTypes.COLOR,
          value: '#ff0000',
        },
      ],
    })).toEqual(true);
  });

  it('should return false', () => {
    expect(hasTokenValues({
      global: [
      ],
    })).toEqual(false);
  });
});
