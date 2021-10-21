import React from 'react';

import {styled} from '@/stitches.config';
import IconBrokenLink from './icons/IconBrokenLink';

const StyledIndicator = styled('div', {
    position: 'absolute',
    top: '3px',
    right: '3px',
    borderRadius: '100%',
    border: '1px solid $white',
    background: '$dangerFg',
    width: '6px',
    height: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

export default function BrokenReferenceIndicator({token, resolvedTokens}) {
    const failedToResolve = React.useMemo(() => {
        return resolvedTokens.find((t) => t.name === token.name).failedToResolve;
    }, [token, resolvedTokens]);

    if (failedToResolve) {
        return (
            <StyledIndicator>
                <IconBrokenLink />
            </StyledIndicator>
        );
    }
    return null;
}
