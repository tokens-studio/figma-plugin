import { styled } from '@/stitches.config';

// Wrapper for extended theme group content to show visual hierarchy lines
export const StyledExtendedThemeGroup = styled('div', {
    position: 'relative',
    display: 'contents', // Don't affect layout, just provide positioning context
});

export const StyledExtendedThemeChildren = styled('div', {
    position: 'relative',
    '&::before': {
        content: '',
        bottom: '14px',
        top: 0,
        left: '12px',
        position: 'absolute',
        width: '4px',
        borderBottomLeftRadius: '$medium',
        borderLeft: '1px solid $borderMuted',
        borderBottom: '1px solid $borderMuted',
    },
});
