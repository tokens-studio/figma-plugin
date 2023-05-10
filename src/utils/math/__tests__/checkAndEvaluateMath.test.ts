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

  it('older clamp continues to work correctly', () => {
    expect(checkAndEvaluateMath('clamp(5,2,4)')).toEqual('clamp(5,2,4)');
    expect(checkAndEvaluateMath('clamp(0,2,4)')).toEqual('clamp(0,2,4)');
    expect(checkAndEvaluateMath('clamp(3,2,4)')).toEqual('clamp(3,2,4)');
  });

  it('clamps expressions correctly', () => {
    expect(checkAndEvaluateMath('clamped(5,2,4)')).toEqual(4);
    expect(checkAndEvaluateMath('clamped(0,2,4)')).toEqual(2);
    expect(checkAndEvaluateMath('clamped(3,2,4)')).toEqual(3);
  });

  it('normalized values as expected', () => {
    expect(checkAndEvaluateMath('norm(10,5,15)')).toEqual(0.5);
    expect(checkAndEvaluateMath('norm(1,1,88)')).toEqual(0);
    expect(checkAndEvaluateMath('norm(3,0,10)')).toEqual(0.3);
  });

  it('lerps values as expected', () => {
    expect(checkAndEvaluateMath('lerp(0.5,5,15)')).toEqual(10);
    expect(checkAndEvaluateMath('lerp(0,1,88)')).toEqual(1);
    expect(checkAndEvaluateMath('lerp(1,47,94)')).toEqual(94);
  });

  it('samples the curve correctly', () => {
    expect(checkAndEvaluateMath('sample(cubicBezier1D(1,0),0.5)')).toEqual(0.5);
    expect(checkAndEvaluateMath('sample(cubicBezier1D(0.33, 0.66),0.8)')).toEqual(0.797);
    expect(checkAndEvaluateMath('sample(cubicBezier1D(0.45,0.34),0.2)')).toEqual(0.213);
    expect(checkAndEvaluateMath('sample(cubicBezier1D(0.45,0.34),0.2)')).toEqual(0.213);
  });
});
