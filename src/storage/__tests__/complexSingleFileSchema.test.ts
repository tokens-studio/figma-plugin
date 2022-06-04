import { complexSingleFileSchema } from '../schemas';

describe('complexSingleFileSchema', () => {
  it('should be valid', () => {
    const validationResult = complexSingleFileSchema.safeParse({
      global: {
        'typescale-example': {
          size: {
            scale: {
              value: '100',
              type: 'sizing',
            },
          },
        },
      },
    });
    expect(validationResult.success).toBe(true);
  });
});
