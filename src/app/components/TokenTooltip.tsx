import React from 'react';
import Box from './Box';
import useTokens from '../store/useTokens';
import { SingleTokenObject } from '@/types/tokens';

function SingleShadow({ shadow }) {
  return (
    <Box css={{ display: 'flex', flexDirection: 'column', marginBottom: '$2' }}>
      <Box css={{ display: 'flex', color: '$contextMenuForegroundMuted' }}>{shadow.type}</Box>
      <Box css={{ display: 'flex' }}>
        {shadow.x}
        {' '}
        {shadow.y}
        {' '}
        {shadow.blur}
        {' '}
        {shadow.spread}
        {' '}
        {shadow.color}
      </Box>
    </Box>
  );
}

// Returns token value in display format
export default function TokenTooltip({ token, resolvedTokens, shouldResolve = false }: { token: SingleTokenObject, resolvedTokens: SingleTokenObject[], shouldResolve?: boolean }) {
  const { getTokenValue } = useTokens();

  try {
    const valueToCheck = shouldResolve ? getTokenValue(token.name, resolvedTokens)?.value : token.value;

    if (token.type === 'typography') {
      if (shouldResolve) {
        return (
          <div>
            {valueToCheck.fontFamily}
            {' '}
            {valueToCheck.fontWeight}
            {' '}
            /
            {' '}
            {valueToCheck.fontSize}
          </div>
        );
      }
      return (
        <div>
          <div>
            Font:
            {' '}
            {valueToCheck.fontFamily?.value || valueToCheck.fontFamily}
          </div>
          <div>
            Weight:
            {' '}
            {valueToCheck.fontWeight?.value || valueToCheck.fontWeight}
          </div>
          <div>
            Leading:
            {' '}
            {valueToCheck.lineHeight?.value || valueToCheck.lineHeight}
          </div>
          <div>
            Tracking:
            {' '}
            {valueToCheck.letterSpacing?.value || valueToCheck.letterSpacing}
          </div>
          <div>
            Paragraph Spacing:
            {' '}
            {valueToCheck.paragraphSpacing?.value || valueToCheck.paragraphSpacing}
          </div>
          <div>
            Text Case:
            {' '}
            {valueToCheck.textCase?.value || valueToCheck.textCase}
          </div>
          <div>
            Text Decoration:
            {' '}
            {valueToCheck.textDecoration?.value || valueToCheck.textDecoration}
          </div>
        </div>
      );
    }

    if (token.type === 'boxShadow') {
      return Array.isArray(valueToCheck) ? (
        <div>
          {valueToCheck.map((t, index) => (
            <SingleShadow key={`shadow-${t.name}-${index}`} shadow={t} />
          ))}
        </div>
      ) : (
        <SingleShadow shadow={valueToCheck} />
      );
    }
    if (typeof valueToCheck !== 'string' && typeof valueToCheck !== 'number') {
      return <div>{JSON.stringify(valueToCheck, null, 2)}</div>;
    }

    return <div>{valueToCheck}</div>;
  } catch (e) {
    console.log('Error rendering tooltip', token, e);
    return null;
  }
}
