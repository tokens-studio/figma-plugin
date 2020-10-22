export function defaultJSON() {
    return {
        spacing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 32,
            xl: 96,
        },
        sizing: {
            xs: 4,
            sm: 8,
            md: 16,
            lg: 32,
            xl: 96,
        },
        borderRadius: {
            sm: 4,
            lg: 8,
            xl: 16,
        },
        colors: {
            indigo: '#5c6ac4',
            blue: '#007ace',
            red: '#de3618',
            redTransparent: 'rgba(255,0,0,0.5)',
            grey: {
                100: '#f5f5f5',
                200: '#eeeeee',
                300: '#e0e0e0',
                400: '#bdbdbd',
                500: '#9e9e9e',
                600: '#757575',
                700: '#616161',
                800: '#424242',
                900: '#212121',
            },
            brand: '$colors.red',
            accent: '$colors.blue',
        },
        opacity: {
            low: '10%',
            md: '50%',
            high: '90%',
        },
        fontFamilies: {
            heading: 'Inter',
            body: 'Roboto',
        },
        lineHeights: {
            heading: '110%',
            body: '140%',
        },
        fontWeights: {
            headingRegular: 'Regular',
            headingBold: 'Bold',
            bodyRegular: 'Regular',
            bodyBold: 'Bold',
        },
        fontSizes: {
            h1: 28,
            h2: 24,
            h3: 22,
            h4: 20,
            h5: 18,
            h6: 16,
            body: 16,
        },
        typography: {
            'H1/Bold': {
                fontFamily: '$fontFamilies.heading',
                fontWeight: '$fontWeights.headingBold',
                lineHeight: '$lineHeights.heading',
                fontSize: '$fontSizes.h1',
            },
            'H1/Regular': {
                fontFamily: '$fontFamilies.heading',
                fontWeight: '$fontWeights.headingRegular',
                lineHeight: '$lineHeights.heading',
                fontSize: '$fontSizes.h1',
            },
            'H2/Bold': {
                fontFamily: '$fontFamilies.heading',
                fontWeight: '$fontWeights.headingBold',
                lineHeight: '$lineHeights.heading',
                fontSize: '$fontSizes.h2',
            },
            Body: {
                fontFamily: '$fontFamilies.body',
                fontWeight: '$fontWeights.bodyRegular',
                lineHeight: '$lineHeights.heading',
                fontSize: '$fontSizes.body',
            },
        },
    };
}

export function defaultDecisions() {
    return {
        colors: {
            primary: '$colors.blue',
            danger: '$colors.red',
        },
    };
}
