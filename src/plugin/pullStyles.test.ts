import pullStyles from './pullStyles';

import * as notifiers from './notifiers';

describe('pullStyles', () => {
    const notifyStyleValuesSpy = jest.spyOn(notifiers, 'notifyStyleValues');

    it('pulls color styles', async () => {
        figma.getLocalPaintStyles.mockReturnValue([
            {
                name: 'red/500',
                id: '456',
                description: 'the red one',
                paints: [{type: 'SOLID', color: {r: 1, g: 0, b: 0}, opacity: 1}],
            },
            {
                name: 'blue/500',
                id: '567',
                description: 'the blue one',
                paints: [{type: 'SOLID', color: {r: 0, g: 0, b: 1}, opacity: 0.5}],
            },
        ]);
        await pullStyles({colorStyles: true});

        expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
            colors: [
                {
                    name: 'red.500',
                    type: 'color',
                    value: '#ff0000',
                    description: 'the red one',
                },
                {
                    name: 'blue.500',
                    type: 'color',
                    value: '#0000ff80',
                    description: 'the blue one',
                },
            ],
            typography: [],
            fontFamilies: [],
            lineHeights: [],
            fontWeights: [],
            fontSizes: [],
            letterSpacing: [],
            paragraphSpacing: [],
            textCase: [],
            textDecoration: [],
        });
    });

    it('pulls text styles', async () => {
        figma.getLocalTextStyles.mockReturnValue([
            {
                name: 'heading/h1/bold',
                id: '456',
                description: 'the big one',
                fontSize: 24,
                fontName: {
                    family: 'Inter',
                    style: 'Bold',
                },
                lineHeight: {
                    unit: 'AUTO',
                },
                paragraphSpacing: 0,
                letterSpacing: {
                    unit: 'PERCENT',
                    value: 0,
                },
                textCase: 'ORIGINAL',
                textDecoration: 'NONE',
            },
            {
                name: 'heading/h2/regular',
                id: '456',
                description: 'the small regular one',
                fontSize: 16,
                fontName: {
                    family: 'Inter',
                    style: 'Regular',
                },
                lineHeight: {
                    unit: 'AUTO',
                },
                paragraphSpacing: 0,
                letterSpacing: {
                    unit: 'PERCENT',
                    value: 0,
                },
                textCase: 'ORIGINAL',
                textDecoration: 'NONE',
            },
            {
                name: 'copy/regular',
                id: '121',
                description: '',
                fontSize: 16,
                fontName: {
                    family: 'Roboto',
                    style: 'Regular',
                },
                lineHeight: {
                    unit: 'AUTO',
                },
                paragraphSpacing: 0,
                letterSpacing: {
                    unit: 'PERCENT',
                    value: 0,
                },
                textCase: 'ORIGINAL',
                textDecoration: 'NONE',
            },
        ]);
        await pullStyles({textStyles: true});

        expect(notifyStyleValuesSpy).toHaveBeenCalledWith({
            colors: [],
            typography: [
                {
                    name: 'heading.h1.bold',
                    type: 'typography',
                    value: {
                        fontFamily: '$fontFamilies.inter',
                        fontWeight: '$fontWeights.inter-0',
                        fontSize: '$fontSize.1',
                        letterSpacing: '$letterSpacing.0',
                        lineHeight: '$lineHeights.0',
                        paragraphSpacing: '$paragraphSpacing.0',
                        textCase: '$textCase.ORIGINAL',
                        textDecoration: '$textDecoration.NONE',
                    },
                    description: 'the big one',
                },
                {
                    name: 'heading.h2.regular',
                    type: 'typography',
                    value: {
                        fontFamily: '$fontFamilies.inter',
                        fontWeight: '$fontWeights.inter-1',
                        fontSize: '$fontSize.0',
                        letterSpacing: '$letterSpacing.0',
                        lineHeight: '$lineHeights.0',
                        paragraphSpacing: '$paragraphSpacing.0',
                        textCase: '$textCase.ORIGINAL',
                        textDecoration: '$textDecoration.NONE',
                    },
                    description: 'the small regular one',
                },
                {
                    name: 'copy.regular',
                    type: 'typography',
                    value: {
                        fontFamily: '$fontFamilies.roboto',
                        fontWeight: '$fontWeights.roboto-2',
                        fontSize: '$fontSize.0',
                        letterSpacing: '$letterSpacing.0',
                        lineHeight: '$lineHeights.0',
                        paragraphSpacing: '$paragraphSpacing.0',
                        textCase: '$textCase.ORIGINAL',
                        textDecoration: '$textDecoration.NONE',
                    },
                },
            ],
            fontFamilies: [
                {name: 'fontFamilies.inter', type: 'fontFamilies', value: 'Inter'},
                {name: 'fontFamilies.roboto', type: 'fontFamilies', value: 'Roboto'},
            ],
            lineHeights: [{name: 'lineHeights.0', type: 'lineHeights', value: 'AUTO'}],
            fontWeights: [
                {name: 'fontWeights.inter-0', type: 'fontWeights', value: 'Bold'},
                {name: 'fontWeights.inter-1', type: 'fontWeights', value: 'Regular'},
                {name: 'fontWeights.roboto-2', type: 'fontWeights', value: 'Regular'},
            ],
            fontSizes: [
                {name: 'fontSize.0', type: 'fontSizes', value: '16'},
                {name: 'fontSize.1', type: 'fontSizes', value: '24'},
            ],
            letterSpacing: [{name: 'letterSpacing.0', type: 'letterSpacing', value: '0%'}],
            paragraphSpacing: [{name: 'paragraphSpacing.0', type: 'paragraphSpacing', value: '0'}],
            textCase: [{name: 'textCase.ORIGINAL', type: 'textCase', value: 'ORIGINAL'}],
            textDecoration: [{name: 'textDecoration.NONE', type: 'textDecoration', value: 'NONE'}],
        });
    });
});
