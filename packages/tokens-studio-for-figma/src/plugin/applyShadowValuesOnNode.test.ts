import { BoxShadowTypes } from '@/constants/BoxShadowTypes';
import { TokenTypes } from '@/constants/TokenTypes';
import { MapValuesToTokensResult } from '@/types';
import { AnyTokenList } from '@/types/tokens';
import { applyShadowValuesOnNode } from './applyShadowValuesOnNode';
import { defaultTokenValueRetriever } from './TokenValueRetriever';

const dtcgShadow = {
  offsetX: '2', offsetY: '4', blur: '8', spread: '0', color: '#00000080',
};

async function applyShadow(value: unknown) {
  defaultTokenValueRetriever.initiate({
    tokens: [{
      name: 'shadow', type: TokenTypes.BOX_SHADOW, value, resolvedValueWithReferences: value,
    }] as unknown as AnyTokenList,
  });
  const node = {
    type: 'RECTANGLE',
    effects: [] as Effect[],
    effectStyleId: '',
    getSharedPluginData: () => '',
    setSharedPluginData: () => {},
  };
  await applyShadowValuesOnNode(
    node as unknown as RectangleNode,
    { boxShadow: 'shadow' },
    { boxShadow: value } as MapValuesToTokensResult,
    '16',
  );
  // setEffectValuesOnTarget is not awaited by applyShadowValuesOnNode
  await new Promise((resolve) => { setTimeout(resolve, 0); });
  return node.effects;
}

describe('applyShadowValuesOnNode', () => {
  it.each([
    ['only inset: true', { ...dtcgShadow, inset: true }, 'INNER_SHADOW'],
    ['only inset: false', { ...dtcgShadow, inset: false }, 'DROP_SHADOW'],
    ['neither type nor inset', dtcgShadow, 'DROP_SHADOW'],
    ['an explicit type', { ...dtcgShadow, type: BoxShadowTypes.INNER_SHADOW }, 'INNER_SHADOW'],
  ])('applies a DTCG shadow with %s', async (_, value, type) => {
    const expected = expect.objectContaining({ type, offset: { x: 2, y: 4 }, radius: 8 });
    expect(await applyShadow(value)).toEqual([expected]);
    expect(await applyShadow([value])).toEqual([expected]);
  });

  it('applies a regular x/y shadow', async () => {
    expect(await applyShadow({
      x: '2', y: '4', blur: '8', spread: '0', color: '#00000080', type: BoxShadowTypes.DROP_SHADOW,
    })).toEqual([expect.objectContaining({ type: 'DROP_SHADOW', offset: { x: 2, y: 4 }, radius: 8 })]);
  });

  it('still skips an x/y shadow without a type', async () => {
    expect(await applyShadow({
      x: '2', y: '4', blur: '8', spread: '0', color: '#00000080',
    })).toEqual([]);
  });
});
