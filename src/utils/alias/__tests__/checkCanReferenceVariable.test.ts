import { checkCanReferenceVariable } from '../checkCanReferenceVariable';
import { UpdateTokenPayload } from '@/types/payloads';

describe('checkCanReferenceVariable', () => {
  it('when the token is alias, the matching variable can reference the variable', () => {
    const token = {
      rawValue: '{alias}',
    } as unknown as UpdateTokenPayload;
    expect(checkCanReferenceVariable(token)).toBe(true);
  });

  it('when the token contains color modify, the matching variable doesn\'t reference the variable', () => {
    const token = {
      rawValue: '{alias}',
      $extensions: {
        'studio.tokens': {
          modify: {
            type: 'lighten',
            value: '0.5',
            space: 'sRGB',
          },
        },
      },
    } as unknown as UpdateTokenPayload;
    expect(checkCanReferenceVariable(token)).toBe(false);
  });

  it('when the token has calculation with alias, the matching variable doesn\'t reference the variable', () => {
    const token = {
      rawValue: '{alias} + {alias}',
    } as unknown as UpdateTokenPayload;
    expect(checkCanReferenceVariable(token)).toBe(false);
  });
});
