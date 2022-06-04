import { checkAndEvaluateMath } from '../checkAndEvaluateMath';

describe('checkAndEvaluateMath', () => {
  it('solves simple unit-less expressions', () => {
    expect(checkAndEvaluateMath('10 + 20 * 3')).toEqual(70);
  });

  it('solves simple expressions with units', () => {
    expect(checkAndEvaluateMath('10px + 20px * 3')).toEqual('70px');
    expect(checkAndEvaluateMath('1rem + 2rem * 3')).toEqual('7rem');
    expect(checkAndEvaluateMath('60px / 2')).toEqual('30px');
  });

  it('solves complex expressions with units', () => {
    expect(checkAndEvaluateMath('5px * (2 + 3)')).toEqual('25px');
    expect(checkAndEvaluateMath('(5rem + 10rem * 2) / 2')).toEqual('12.5rem');
    expect(checkAndEvaluateMath('5% - 2% * 2')).toEqual('1%');
  });

  it('does not solve expressions with mismatched units', () => {
    expect(checkAndEvaluateMath('1rem + 1px')).toEqual('1rem + 1px');
    expect(checkAndEvaluateMath('2px * 2px')).toEqual('2px * 2px');
    expect(checkAndEvaluateMath('2px + 10%')).toEqual('2px + 10%');
  });
});
