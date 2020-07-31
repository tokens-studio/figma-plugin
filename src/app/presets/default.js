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
        },
        opacity: {
            low: '10%',
            md: '50%',
            high: '90%',
        },
        fontFamilies: {
            display: 'Inter',
            body: 'Roboto',
        },
        lineHeights: {
            heading: 1.1,
            body: 1.4,
        },
        fontWeights: {
            'heading-light': 300,
            'heading-bold': 700,
            'body-regular': 400,
            'body-bold': 600,
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
            'H1-Bold': {
                fontFamily: '$fontFamilies.display',
                fontWeight: '$fontWeights.heading-bold',
                lineHeight: '$lineHeights.heading',
                fontSize: '$fontSizes.h1',
            },
            'H2-Regular': {
                fontFamily: '$fontFamilies.display',
                fontWeight: '$fontWeights.body-regular',
                lineHeight: '$lineHeights.body',
                fontSize: '$fontSizes.h2',
            },
            Body: {
                fontFamily: '$fontFamilies.body',
                fontWeight: '$fontWeights.body-light',
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
