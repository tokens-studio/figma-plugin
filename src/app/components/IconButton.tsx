import {styled} from '@/stitches.config';
import React from 'react';
import Tooltip from './Tooltip';

const Box = styled('div', {});

export default function IconButton({disabled = false, tooltip, dataCy = null, onClick, icon, css}) {
    return (
        <Box css={css}>
            <Tooltip label={tooltip}>
                <button
                    disabled={disabled}
                    data-cy={dataCy}
                    className="button button-ghost"
                    type="button"
                    onClick={() => {
                        onClick();
                    }}
                >
                    <Box css={{transition: 'transform 200ms ease-in-out', transform: 'var(--transform)'}}>{icon}</Box>
                </button>
            </Tooltip>
        </Box>
    );
}
