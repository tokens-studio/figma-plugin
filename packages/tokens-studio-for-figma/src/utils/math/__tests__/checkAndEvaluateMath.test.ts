import { readFileSync } from 'fs';
import { join } from 'path';
import { checkAndEvaluateMath } from '../checkAndEvaluateMath';
import { TokenResolver } from '../../TokenResolver';
import { getAliasValue } from '../../alias/getAliasValue';
import { SingleToken } from '@/types/tokens';
import {
  baseTokens, droppedSyntax, mathGolden, referenceGolden,
} from './mathGolden';

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

  describe('behaviour frozen from the previous evaluator', () => {
    it.each(mathGolden)('resolves %j to %j', (input, output) => {
      expect(checkAndEvaluateMath(input)).toEqual(output);
    });

    it.each(droppedSyntax)('leaves dropped syntax %j unresolved (was %j)', (input) => {
      expect(checkAndEvaluateMath(input)).toEqual(input);
    });

    it.each(referenceGolden)('resolves the reference %j to %j', (value, resolved, failedToResolve, aliasValue) => {
      const probe = { name: 'probe', value, type: 'number' } as unknown as SingleToken;
      const tokens = baseTokens as unknown as SingleToken[];
      const result = new TokenResolver([...tokens, probe]).resolveTokenValues().find((token) => token.name === 'probe');

      expect(result?.value).toEqual(resolved);
      expect(Boolean(result?.failedToResolve)).toEqual(failedToResolve);
      expect(getAliasValue(probe, tokens)).toEqual(aliasValue);
    });
  });

  it('never exposes the prototype chain through names', () => {
    ['constructor', '__proto__', 'prototype', 'toString', 'hasOwnProperty', 'valueOf'].forEach((name) => {
      expect(checkAndEvaluateMath(`${name}(1)`)).toEqual(`${name}(1)`);
      expect(checkAndEvaluateMath(`${name} + 1`)).toEqual(`${name} + 1`);
    });
  });

  it('returns the input for very deep nesting instead of throwing', () => {
    const deep = `${'('.repeat(50000)}1${')'.repeat(50000)}`;
    expect(checkAndEvaluateMath(deep)).toEqual(deep);
  });

  it('does not depend on expr-eval', () => {
    const manifest = JSON.parse(readFileSync(join(__dirname, '../../../../package.json'), 'utf8'));
    expect(manifest.dependencies['expr-eval']).toBeUndefined();
    expect(readFileSync(join(__dirname, '../checkAndEvaluateMath.ts'), 'utf8')).not.toContain('expr-eval');
  });
});
