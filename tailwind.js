module.exports = {
    purge: {
        enabled: true,
        content: ['./app/src/**/*.html', './src/app/**/*.tsx', './src/app/**/*.jsx'],
    },
    important: true,
    theme: {
        extend: {
            colors: {
                gray: {
                    '100': '#f5f5f5',
                    '200': '#eeeeee',
                    '300': '#e0e0e0',
                    '400': '#bdbdbd',
                    '500': '#9e9e9e',
                    '600': '#757575',
                    '700': '#616161',
                    '800': '#424242',
                    '900': '#212121',
                },
                primary: {
                    100: '#daebf7',
                    400: '#3CB1FF',
                    500: '#18A0FB',
                },
            },
            fontSize: {
                xxs: '0.7rem',
            },
            fontFamily: {
                body: ['Inter', 'sans-serif'],
            },
            zIndex: {
                1: '1',
            },
        },
    },
};
