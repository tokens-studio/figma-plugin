module.exports = {
    purge: {
        enabled: true,
        content: ['./app/src/**/*.html', './src/app/**/*.tsx', './src/app/**/*.jsx'],
    },
    important: true,
    theme: {
        extend: {
            colors: {
                primary: {
                    400: '#3A84DF',
                    500: '#206AC3',
                },
            },
            fontSize: {
                xxs: '0.65rem',
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
