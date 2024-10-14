import { compositionFields } from '../utils';

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
            value
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
            value
            border {
                width
                style
                color
            }
        }
        ... on Raw_Token_boxShadow {
            value
            boxShadow {
                x
                y
                blur
                spread
                color
                type
            }
        }
        ... on Raw_Token_composition {
            value
            composition {
                ${compositionFields}
            }
        }
    }
`;
