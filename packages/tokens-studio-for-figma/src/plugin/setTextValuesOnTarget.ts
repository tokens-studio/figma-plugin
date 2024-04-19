import { ResolvedTypographyObject } from './ResolvedTypographyObject';
import { defaultTokenValueRetriever } from './TokenValueRetriever';
import { tryApplyTypographyCompositeVariable } from './tryApplyTypographyCompositeVariable';

export async function setTextValuesOnTarget(
  target: TextNode | TextStyle,
  token: string,
  baseFontSize: string = '16',
) {
  try {
    const resolvedToken = defaultTokenValueRetriever.get(token);
    if (typeof resolvedToken === 'undefined') return;
    const { value, description } = resolvedToken;
    const resolvedValue: ResolvedTypographyObject = defaultTokenValueRetriever.get(token)?.resolvedValueWithReferences;
    if (typeof resolvedValue === 'undefined') return;

    if (typeof resolvedValue !== 'string') {
      await tryApplyTypographyCompositeVariable({
        target, baseFontSize, value, resolvedValue, // maybe this needs to be value
      });
      if ('description' in target && description) target.description = description;
    }
  } catch (e) {
    console.log('Error setting font on target', target, token, e);
  }
}
