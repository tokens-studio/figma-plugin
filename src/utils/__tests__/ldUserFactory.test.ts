import { ldUserFactory } from '../ldUserFactory';

describe('ldUserFactory', () => {
  it('should work', () => {
    expect(ldUserFactory('user', 'pro', ['pro'], 'example@domain.com')).toEqual({
      key: 'user',
      custom: {
        plan: 'pro',
        pro: true,
      },
      email: 'example@domain.com',
    });
  });
});
