import getAliasValue from '@/utils/aliases';
import React from 'react';
import Box from './Box';

// Returns token value in display format
export default function TokenTooltip({token, resolvedTokens, shouldResolve = false}) {
    try {
        const valueToCheck = shouldResolve ? getAliasValue(token, resolvedTokens) : token.value;

        if (token.type === 'typography') {
            if (shouldResolve) {
                return (
                    <div>
                        {valueToCheck.fontFamily} {valueToCheck.fontWeight} / {valueToCheck.fontSize}
                    </div>
                );
            }
            return (
                <div>
                    <div>Font: {valueToCheck.fontFamily?.value || valueToCheck.fontFamily}</div>
                    <div>Weight: {valueToCheck.fontWeight?.value || valueToCheck.fontWeight}</div>
                    <div>Leading: {valueToCheck.lineHeight?.value || valueToCheck.lineHeight}</div>
                    <div>Tracking: {valueToCheck.lineHeight?.value || valueToCheck.lineHeight}</div>
                    <div>
                        Paragraph Spacing: {valueToCheck.paragraphSpacing?.value || valueToCheck.paragraphSpacing}
                    </div>
                    <div>Text Case: {valueToCheck.textCase?.value || valueToCheck.textCase}</div>
                    <div>Text Decoration: {valueToCheck.textDecoration?.value || valueToCheck.textDecoration}</div>
                </div>
            );
        }

        if (token.type === 'boxShadow') {
            return Array.isArray(valueToCheck) ? (
                <div>
                    <div>
                        {valueToCheck.map((t) => (
                            <Box css={{marginBottom: '$2'}}>
                                <Box css={{color: '$contextMenuForegroundMuted'}}>{t.type}</Box>
                                <Box>
                                    {t.x} {t.y} {t.blur} {t.spread} {t.color}
                                </Box>
                            </Box>
                        ))}
                    </div>
                </div>
            ) : (
                <div>
                    <div>Type: {valueToCheck.type?.value || valueToCheck.type}</div>
                    <div>X: {valueToCheck.x?.value || valueToCheck.x}</div>
                    <div>Y: {valueToCheck.y?.value || valueToCheck.y}</div>
                    <div>Blur: {valueToCheck.blur?.value || valueToCheck.blur}</div>
                    <div>Spread: {valueToCheck.spread?.value || valueToCheck.spread}</div>
                </div>
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
