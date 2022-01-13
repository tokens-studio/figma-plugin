// stitches.config.ts
import {createCss} from '@stitches/react';

const globalTokens = {
    colors: {
        white: '#FFFFFF',
        gray50: 'var(--theme-colors-gray-50, #FAFAFA)',
        gray100: 'var(--theme-colors-gray-100, #f5f5f5)',
        gray200: 'var(--theme-colors-gray-200, #eeeeee)',
        gray300: 'var(--theme-colors-gray-300, #e0e0e0)',
        gray400: 'var(--theme-colors-gray-400, #bdbdbd)',
        gray500: 'var(--theme-colors-gray-500, #9e9e9e)',
        gray600: 'var(--theme-colors-gray-600, #757575)',
        gray700: 'var(--theme-colors-gray-700, #616161)',
        gray800: 'var(--theme-colors-gray-800, #424242)',
        gray900: 'var(--theme-colors-gray-900, #2C2C2C)',
        gray950: 'var(--theme-colors-gray-950, #222222)',
        primary50: 'var(--theme-colors-brand-50, #F5FBFF)',
        primary100: 'var(--theme-colors-brand-100, #E1F3FF)',
        primary300: 'var(--theme-colors-brand-300, #90CDF4)',
        primary400: 'var(--theme-colors-brand-300, #3CB1FF)',
        primary500: 'var(--theme-colors-brand-500, #18A0FB)',
        red500: 'var(--red, #f24822)',
    },
    radii: {
        sm: '2px',
        lg: '4px',
    },
};

export const {styled, css, global: globalCSS, keyframes, getCssString, theme} = createCss({
    theme: {
        colors: {
            bgDefault: globalTokens.colors.white,
            contextMenuBackground: globalTokens.colors.gray950,
            contextMenuForeground: globalTokens.colors.white,
            contextMenuForegroundMuted: globalTokens.colors.gray400,
            contextMenuSeperator: globalTokens.colors.gray700,
            text: globalTokens.colors.gray900,
            textMuted: globalTokens.colors.gray500,
            textDisabled: globalTokens.colors.gray400,
            interaction: globalTokens.colors.primary500,
            onInteraction: globalTokens.colors.white,
            interactionDisabled: globalTokens.colors.gray600,
            dangerFg: globalTokens.colors.red500,
            border: globalTokens.colors.gray300,
            focus: globalTokens.colors.primary300,
        },
        space: {
            1: '2px',
            2: '4px',
            3: '8px',
            4: '12px',
            5: '16px',
            6: '24px',
            7: '32px',
            8: '48px',
        },
        radii: {
            default: globalTokens.radii.sm,
            button: globalTokens.radii.sm,
            input: globalTokens.radii.sm,
            contextMenu: globalTokens.radii.lg,
            contextMenuItem: globalTokens.radii.sm,
        },
        shadows: {
            default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            focus: `0 0 0 2px ${globalTokens.colors.primary500}`,
            'focus-subtle': `0 0 0 2px ${globalTokens.colors.primary300}`,
            'focus-muted': `0 0 0 2px ${globalTokens.colors.primary400}`,
        },
    },
});
