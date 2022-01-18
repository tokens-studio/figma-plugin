module.exports = {
    extends: ['airbnb-typescript-prettier'],
    globals: {
        "figma": "readable",
        "__html__": "readable",
        "describe": "readable",
        "it": "readable",
        "expect": "readable",
    },
    rules: {
        'react/jsx-props-no-spreading': 0
    }
};
