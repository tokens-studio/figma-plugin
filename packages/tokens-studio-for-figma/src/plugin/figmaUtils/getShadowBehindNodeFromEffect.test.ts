import { getShadowBehindNodeFromEffect } from './getShadowBehindNodeFromEffect';

describe('getShadowBehindNodeFromEffect', () => {
  const dropShadowWithTrue: Effect = {
    type: 'DROP_SHADOW',
    showShadowBehindNode: true,
  };
  const dropShadowWithFalse: Effect = {
    type: 'DROP_SHADOW',
    showShadowBehindNode: false,
  };
  const innerShadow: Effect = {
    type: 'INNER_SHADOW',
  };
  it('returns the correct values for effects', () => {
    expect(getShadowBehindNodeFromEffect(dropShadowWithTrue)).toBeTruthy();
    expect(getShadowBehindNodeFromEffect(dropShadowWithFalse)).toBeFalsy();
    expect(getShadowBehindNodeFromEffect(innerShadow)).toBeFalsy();
  });
  it('returns false when no effect was given', () => {
    const effectArray = [dropShadowWithTrue, dropShadowWithFalse, innerShadow];
    expect(getShadowBehindNodeFromEffect(effectArray[3])).toBeFalsy();
  });
});
