import { TokenResolver } from '@/utils/TokenResolver';
import { mergeServerResolvedTokens } from '@/utils/tokenHelpers';
import { TokenTypes } from '@/constants/TokenTypes';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import setColorValuesOnTarget from './setColorValuesOnTarget';
import type { AnyTokenList } from '@/types/tokens';

const serverGradient = '{angle: 90, kind: linear, stops: [{color: #ff0000, position: 0},{color: #0000ff, position: 1}]}';

async function paintFromServerGradient(tokens: AnyTokenList) {
  const merged = mergeServerResolvedTokens(new TokenResolver([]).setTokens(tokens), { 'gradient.brand': serverGradient });
  defaultTokenValueRetriever.initiate({ tokens: merged });
  const target = { paints: [] as Paint[] } as PaintStyle;
  await setColorValuesOnTarget({ target, token: 'gradient.brand', key: 'paints' });
  return target.paints;
}

describe('setColorValuesOnTarget with server-resolved gradients', () => {
  afterEach(() => defaultTokenValueRetriever.clearCache());

  it('creates a gradient paint from literal stops', async () => {
    const paints = await paintFromServerGradient([{
      name: 'gradient.brand',
      type: TokenTypes.GRADIENT,
      value: { kind: 'linear', angle: 90, stops: [{ color: '#ff0000', position: 0 }, { color: '#0000ff', position: 1 }] },
    }] as unknown as AnyTokenList);

    expect(paints).toHaveLength(1);
    expect((paints[0] as GradientPaint).gradientStops).toHaveLength(2);
  });
});
