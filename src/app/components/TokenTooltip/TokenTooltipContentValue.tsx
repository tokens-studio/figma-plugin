import React from 'react';
import get from 'just-safe-get';
import { useUIDSeed } from 'react-uid';
import useTokens from '../../store/useTokens';
import { SingleToken } from '@/types/tokens';
import { SingleShadowValueDisplay } from './SingleShadowValueDisplay';
import { TokensContext } from '@/context';
import {
  isSingleBoxShadowToken, isSingleTypographyToken, isSingleCompositionToken, isSingleBorderToken,
} from '@/utils/is';
import { SingleTypographyValueDisplay } from './SingleTypographyValueDisplay';
import { TokenBorderValue, TokenBoxshadowValue, TokenTypographyValue } from '@/types/values';
import { SingleCompositionValueDisplay } from './SingleCompositionValueDisplay';
import TooltipProperty from './TooltipProperty';
import Stack from '../Stack';
import { CompositionTokenValue } from '@/types/CompositionTokenProperty';
import { SingleBorderValueDisplay } from './SingleBorderValueDisplay';
import { isColorToken } from '@/utils/is/isColorToken';
import { SingleColorValueDisplay } from './SingleColorValueDisplay';

type Props = {
  token: SingleToken;
};

// Returns token value in display format
export const TokenTooltipContentValue: React.FC<Props> = ({ token }) => {
  const seed = useUIDSeed();
  const tokensContext = React.useContext(TokensContext);
  const { getTokenValue } = useTokens();
  const resolvedValue = React.useMemo(() => getTokenValue(token.name, tokensContext.resolvedTokens)?.value, [
    token,
    getTokenValue,
    tokensContext.resolvedTokens,
  ]);

  if (isSingleTypographyToken(token)) {
    return (
      <SingleTypographyValueDisplay
        value={token.value as TokenTypographyValue}
        resolvedValue={resolvedValue as TokenTypographyValue}
      />
    );
  }

  if (
    resolvedValue
    && typeof resolvedValue !== 'string'
    && !Array.isArray(resolvedValue)
    && isSingleCompositionToken(token)
  ) {
    return (
      <Stack direction="column" align="start" gap={2} wrap>
        {Object.entries(token.value).map(([property, value], index) => (
          <SingleCompositionValueDisplay
            key={seed(index)}
            property={property}
            value={value}
            // @TODO strengthen the type checking here
            resolvedValue={get(resolvedValue, property) as CompositionTokenValue}
          />
        ))}
      </Stack>
    );
  }

  if (isSingleBoxShadowToken(token)) {
    if (Array.isArray(resolvedValue)) {
      return (
        <Stack direction="column" align="start" gap={3} wrap>
          {typeof token.value === 'string' ? (
            <TooltipProperty
              value={token.value}
            />
          ) : null}
          {resolvedValue.map((t, index) => (
            <SingleShadowValueDisplay
              key={seed(t)}
              value={Array.isArray(token.value) ? token.value[index] as TokenBoxshadowValue : undefined}
              resolvedValue={t as TokenBoxshadowValue}
            />
          ))}
        </Stack>
      );
    }

    return (
      <div>
        {typeof token.value === 'string' ? (
          <TooltipProperty
            value={token.value}
          />
        ) : null}
        <SingleShadowValueDisplay
          // @TODO strengthen type checking here
          value={token.value as TokenBoxshadowValue}
          resolvedValue={resolvedValue as TokenBoxshadowValue}
        />
      </div>
    );
  }

  if (isSingleBorderToken(token)) {
    return (
      <SingleBorderValueDisplay
        value={token.value as TokenBorderValue}
        resolvedValue={resolvedValue as TokenBorderValue}
      />
    );
  }

  if (isColorToken(token)) {
    return (
      <SingleColorValueDisplay
        value={String(token.value)}
        resolvedValue={String(resolvedValue)}
        modifier={token.$extensions?.['studio.tokens']?.modify}
      />
    );
  }

  if (typeof token.value !== 'string' && typeof token.value !== 'number') {
    return <TooltipProperty value={JSON.stringify(token.value, null, 2)} />;
  }

  if (resolvedValue && typeof resolvedValue !== 'string' && typeof resolvedValue !== 'number') {
    return <TooltipProperty value={token.value} resolvedValue={JSON.stringify(resolvedValue, null, 2)} />;
  }

  return <TooltipProperty value={token.value} resolvedValue={resolvedValue} />;
};
