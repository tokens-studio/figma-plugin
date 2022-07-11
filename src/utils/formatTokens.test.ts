import { TokenTypes } from '@/constants/TokenTypes';
import { AnyTokenList } from '@/types/tokens';
import formatTokens from './formatTokens';

describe('formatTokens', () => {
  const typographyTokens = {
    global: [
      { name: 'withValue', value: 'bar' },
      { name: 'basic', value: '#ff0000' },
      {
        name: 'typography.heading.h1',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Bold',
          fontSize: 36,
        },
        description: 'Use for bold headings',
        type: TokenTypes.TYPOGRAPHY,
      },
      {
        name: 'typography.heading.h2',
        value: {
          fontFamily: 'Inter',
          fontWeight: 'Regular',
          fontSize: 24,
        },
        description: 'Use for headings',
        type: TokenTypes.TYPOGRAPHY,
      },
      {
        name: 'typography.heading.alias',
        value: '{typography.heading.h1}',
        description: 'Use for headings',
        type: TokenTypes.TYPOGRAPHY,
      },
      {
        type: TokenTypes.BOX_SHADOW,
        name: 'shadows.md',
        value: [
          {
            type: 'dropShadow',
            color: 'rgba({colors.red.500}, 0.5)',
            x: 0,
            y: 0,
            blur: 2,
            spread: 4,
          },
        ],
      },
    ],
  } as unknown as Record<string, AnyTokenList>;

  // it('converts given tokens to an array', () => {
  //   expect(formatTokens({
  //     tokens: typographyTokens, tokenSets: ['global'], resolvedTokens: typographyTokens, expandTypography: true, expandShadow: false,
  //   })).toEqual(
  //     JSON.stringify(
  //       {
  //         global: {
  //           withValue: {
  //             value: 'bar',
  //           },
  //           basic: {
  //             value: '#ff0000',
  //           },
  //           typography: {
  //             heading: {
  //               h1: {
  //                 fontFamily: {
  //                   value: 'Inter',
  //                   type: 'fontFamily',
  //                 },
  //                 fontWeight: {
  //                   value: 'Bold',
  //                   type: 'fontWeight',
  //                 },
  //                 fontSize: {
  //                   value: 36,
  //                   type: 'fontSize',
  //                 },
  //               },
  //               h2: {
  //                 fontFamily: {
  //                   value: 'Inter',
  //                   type: 'fontFamily',
  //                 },
  //                 fontWeight: {
  //                   value: 'Regular',
  //                   type: 'fontWeight',
  //                 },
  //                 fontSize: {
  //                   value: 24,
  //                   type: 'fontSize',
  //                 },
  //               },
  //               alias: {
  //                 fontFamily: {
  //                   value: 'Inter',
  //                   type: 'fontFamily',
  //                 },
  //                 fontWeight: {
  //                   value: 'Bold',
  //                   type: 'fontWeight',
  //                 },
  //                 fontSize: {
  //                   value: 36,
  //                   type: 'fontSize',
  //                 },
  //               },
  //             },
  //           },
  //           shadows: {
  //             md: {
  //               type: TokenTypes.BOX_SHADOW,
  //               value: [
  //                 {
  //                   type: 'dropShadow',
  //                   color: 'rgba({colors.red.500}, 0.5)',
  //                   x: 0,
  //                   y: 0,
  //                   blur: 2,
  //                   spread: 4,
  //                 },
  //               ],
  //             },
  //           },
  //         },
  //       },
  //       null,
  //       2,
  //     ),
  //   );
  // });

  // it('converts given tokens to an array without expanding', () => {
  //   expect(formatTokens({
  //     tokens: typographyTokens, tokenSets: ['global'], expandTypography: false, expandShadow: true,
  //   })).toEqual(
  //     JSON.stringify(
  //       {
  //         global: {
  //           withValue: {
  //             value: 'bar',
  //           },
  //           basic: {
  //             value: '#ff0000',
  //           },
  //           typography: {
  //             heading: {
  //               h1: {
  //                 value: {
  //                   fontFamily: 'Inter',
  //                   fontWeight: 'Bold',
  //                   fontSize: 36,
  //                 },
  //                 description: 'Use for bold headings',
  //                 type: 'typography',
  //               },
  //               h2: {
  //                 value: {
  //                   fontFamily: 'Inter',
  //                   fontWeight: 'Regular',
  //                   fontSize: 24,
  //                 },
  //                 description: 'Use for headings',
  //                 type: 'typography',
  //               },
  //             },
  //           },
  //           shadows: {
  //             md: {
  //               0: {
  //                 type: {
  //                   value: 'dropShadow',
  //                   type: 'type',
  //                 },
  //                 color: {
  //                   value: 'rgba({colors.red.500}, 0.5)',
  //                   type: 'color',
  //                 },
  //                 x: {
  //                   value: 0,
  //                   type: 'x',
  //                 },
  //                 y: {
  //                   value: 0,
  //                   type: 'y',
  //                 },
  //                 blur: {
  //                   value: 2,
  //                   type: 'blur',
  //                 },
  //                 spread: {
  //                   value: 4,
  //                   type: 'spread',
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //       null,
  //       2,
  //     ),
  //   );
  // });
});
