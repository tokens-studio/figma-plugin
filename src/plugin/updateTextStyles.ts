import { TypographyToken } from '../types/propertyTypes';
import filterMatchingStyles from './figmaUtils/filterMatchingStyles';
import setTextValuesOnTarget from './setTextValuesOnTarget';

export default function updateTextStyles(textTokens, shouldCreate = false) {
  // Iterate over textTokens to create objects that match figma styles
  const textStyles = figma.getLocalTextStyles();

  textTokens.map((token: TypographyToken) => {
    let matchingStyles = [];
    if (textStyles.length > 0) {
      matchingStyles = filterMatchingStyles(token, textStyles);
    }

    if (matchingStyles.length) {
      setTextValuesOnTarget(matchingStyles[0], token);
    } else if (shouldCreate) {
      const style = figma.createTextStyle();
      style.name = token.name;
      setTextValuesOnTarget(style, token);
    }
  });
}
