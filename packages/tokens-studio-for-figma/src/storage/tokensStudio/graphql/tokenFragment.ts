export const TOKEN_FRAGMENT = `
    description
    name
    urn
    extensions
    setUrn
    type
    value {
        ... on Raw_Token_scalar {
            value
        }
        ... on Raw_Token_typography {
            typography {
                textDecoration
                textCase
                lineHeight
                letterSpacing
                fontSize
                fontFamily
                fontWeight
                paragraphIndent
                paragraphSpacing
            }
        }
        ... on Raw_Token_border {
            border {
                width
                style
                color
            }
        }
        ... on Raw_Token_boxShadow {
            boxShadow {
                x
                y
                blur
                spread
                color
                type
            }
        }
    }
`;
