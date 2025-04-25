import { TokenFormatOptions, setFormat } from '@/plugin/TokenFormatStoreClass';
import stringifyTokens from './stringifyTokens';

describe('stringfyTokens', () => {
  const tokens = {
    global: [
      {
        name: 'scale',
        type: 'sizing',
        value: '1',
      },
      {
        inheritTypeLevel: 2,
        name: 'font.small',
        type: 'sizing',
        value: '2',
      },
      {
        inheritTypeLevel: 2,
        name: 'font.big',
        type: 'sizing',
        value: '3',
      },
      {
        name: 'font.medium',
        type: 'dimension',
        value: '3',
      },
      {
        inheritTypeLevel: 2,
        name: 'typography.headline',
        type: 'typography',
        value: {
          fontFamily: 'aria',
          fontWeight: 'bold',
          lineHeight: '12',
        },
      },
      {
        name: 'typography.content',
        type: 'typography',
        value: {
          fontFamily: 'aria',
          fontWeight: 'light',
          lineHeight: '3',
        },
      },
      {
        inheritTypeLevel: 2,
        name: 'box.default',
        type: 'boxShadow',
        value: {
          blur: '2',
          color: '#000000',
          spread: '0',
          type: 'innerShadow',
          x: '2',
          y: '2',
        },
      },
      {
        inheritTypeLevel: 1,
        name: 'mx',
        value: '4',
        type: 'sizing',
      },
    ],
  };
  const emptyTokens = {
    core: [],
  };
  const activeTokenSet = 'global';
  it('convert token list to the JSON string with nested structure', () => {
    setFormat(TokenFormatOptions.DTCG);
    expect(stringifyTokens(tokens, activeTokenSet)).toEqual(
      JSON.stringify(
        {
          scale: {
            $type: 'sizing',
            $value: '1',
          },
          font: {
            $type: 'sizing',
            small: {
              $value: '2',
            },
            big: {
              $value: '3',
            },
            medium: {
              $type: 'dimension',
              $value: '3',
            },
          },
          typography: {
            $type: 'typography',
            headline: {
              $value: {
                fontFamily: 'aria',
                fontWeight: 'bold',
                lineHeight: '12',
              },
            },
            content: {
              $type: 'typography',
              $value: {
                fontFamily: 'aria',
                fontWeight: 'light',
                lineHeight: '3',
              },
            },
          },
          box: {
            $type: 'boxShadow',
            default: {
              $value: {
                blur: '2',
                color: '#000000',
                spread: '0',
                type: 'innerShadow',
                x: '2',
                y: '2',
              },
            },
          },
          $type: 'sizing',
          mx: {
            $value: '4',
          },
        },
        null,
        2,
      ),
    );
    expect(stringifyTokens(emptyTokens, activeTokenSet)).toEqual('{}');
  });

  it('convert legacy token list to the JSON string with nested structure', () => {
    const input = {
      global: [
        {
          name: 'scale.small',
          type: 'spacing',
          value: '4px',
          inheritTypeLevel: 2,
        },
        {
          name: 'scale.medium',
          type: 'spacing',
          value: '8px',
          inheritTypeLevel: 2,
        },
        {
          name: 'scale.large',
          value: '12px',
          type: 'sizing',
        },
      ],
    };
    setFormat(TokenFormatOptions.Legacy);
    expect(stringifyTokens(input, activeTokenSet)).toEqual(
      JSON.stringify(
        {
          scale: {
            type: 'spacing',
            small: {
              value: '4px',
            },
            medium: {
              value: '8px',
            },
            large: {
              value: '12px',
              type: 'sizing',
            },
          },
        },
        null,
        2,
      ),
    );
  });
});
