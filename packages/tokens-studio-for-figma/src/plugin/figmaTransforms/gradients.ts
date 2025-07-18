import { figmaRGBToHex, extractLinearGradientParamsFromTransform } from '@figma-plugin/helpers';
import { Matrix } from 'ml-matrix';
import { convertToFigmaColor } from './colors';

export function convertDegreeToNumber(degreeString: string): number {
  return parseFloat(degreeString.split('deg').join(''));
}

export function convertFigmaGradientToString(paint: GradientPaint) {
  const { gradientTransform, gradientStops } = paint;
  const gradientStopsString = gradientStops
    .map((stop) => `${figmaRGBToHex(stop.color)} ${Math.round(stop.position * 100 * 100) / 100}%`)
    .join(', ');
  const { start, end } = extractLinearGradientParamsFromTransform(1, 1, gradientTransform);
  const angleInRad = Math.atan2(end[1] - start[1], end[0] - start[0]);
  const angleInDeg = Math.round((angleInRad * 180) / Math.PI);
  return `linear-gradient(${angleInDeg + 90}deg, ${gradientStopsString})`;
}

const roundToPrecision = (value, precision = 10) => {
  const roundToPrecisionVal = 10 ** precision;
  return Math.round((value + Number.EPSILON) * roundToPrecisionVal) / roundToPrecisionVal;
};

// Helper function to parse gradient parts while respecting parentheses
function parseGradientParts(innerContent: string): string[] {
  const parts: string[] = [];
  let current = '';
  let parenDepth = 0;
  let i = 0;

  while (i < innerContent.length) {
    const char = innerContent[i];

    if (char === '(') {
      parenDepth += 1;
      current += char;
    } else if (char === ')') {
      parenDepth -= 1;
      current += char;
    } else if (char === ',' && parenDepth === 0) {
      // We're at a top-level comma, so this is a separator
      parts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i += 1;
  }

  // Don't forget the last part
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

// if node type check is needed due to bugs caused by obscure node types, use (value: string/*, node?: BaseNode | PaintStyle) and convertStringToFigmaGradient(value, target)
export function convertStringToFigmaGradient(value: string) {
  const innerContent = value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
  const parts = parseGradientParts(innerContent);

  // Default angle is to top (180 degrees)
  let angle = 180;
  if (parts[0].includes('deg')) {
    angle = parseFloat(parts[0].replace('deg', ''));
    parts.shift();
  } else if (parts[0].includes('turn')) {
    angle = parseFloat(parts[0].replace('turn', '')) * 360;
    parts.shift();
  } else if (parts[0].startsWith('to ')) {
    const direction = parts[0].replace('to ', '');
    parts.shift();
    switch (direction) {
      case 'top':
        angle = 180;
        break;
      case 'right':
        angle = 270;
        break;
      case 'bottom':
        angle = 0;
        break;
      case 'left':
        angle = 90;
        break;
      case 'top right':
        angle = 225;
        break;
      case 'top left':
        angle = 135;
        break;
      case 'bottom right':
        angle = 315;
        break;
      case 'bottom left':
        angle = 45;
        break;
      default:
        break;
    }
  }

  const degrees = -(angle - 90);
  const rad = degrees * (Math.PI / 180);

  let normalizedAngleRad = Math.abs(rad) % (Math.PI / 2);
  if (normalizedAngleRad > Math.PI / 4) {
    // adjust angle after 45 degrees to scale down correctly towards 90 degrees
    normalizedAngleRad = Math.PI / 2 - normalizedAngleRad;
  }

  const sin = Math.sin(rad);
  const cos = Math.cos(rad);

  let scale = 1;

  const normalisedCos = Math.cos(normalizedAngleRad);
  scale = normalisedCos;
  // Implement fallback if bugs are caused by obscure node types. This appears to be unnecessary
  // if (!['RECTANGLE', 'FRAME', 'VECTOR'].includes(node?.type || '')) {
  //   // Old scale computation:
  //   scale = angle % 90 === 0 ? 1 : Math.sqrt(1 + Math.tan(angle * (Math.PI / 180)) ** 2);
  // }

  const scaledCos = cos * scale;
  const scaledSin = sin * scale;

  // start by transforming to the gradient center, to keep the gradient centered after scaling
  // which for figma is .5 .5 as it is a relative transform
  const tx = 0.5 - 0.5 * scaledCos + 0.5 * scaledSin;
  const ty = 0.5 - 0.5 * scaledSin - 0.5 * scaledCos;

  const transformationMatrix = new Matrix([
    [roundToPrecision(scaledCos), roundToPrecision(-scaledSin), roundToPrecision(tx)],
    [roundToPrecision(scaledSin), roundToPrecision(scaledCos), roundToPrecision(ty)],
    [0, 0, 1],
  ]);

  const gradientTransformMatrix = transformationMatrix.to2DArray();

  const gradientStops = parts.map((stop, i, arr) => {
    // Separate color from position by finding the last space outside parentheses
    let colorPart = stop;
    let positionPart = '';
    let parenDepth = 0;
    let lastSpaceIndex = -1;

    for (let j = 0; j < stop.length; j += 1) {
      const char = stop[j];
      if (char === '(') {
        parenDepth += 1;
      } else if (char === ')') {
        parenDepth -= 1;
      } else if (char === ' ' && parenDepth === 0) {
        lastSpaceIndex = j;
      }
    }

    if (lastSpaceIndex > -1) {
      const potentialPosition = stop.substring(lastSpaceIndex + 1);
      // Check if this looks like a percentage or numeric position
      if (potentialPosition.includes('%') || /^\d+(\.\d+)?$/.test(potentialPosition)) {
        colorPart = stop.substring(0, lastSpaceIndex);
        positionPart = potentialPosition;
      }
    }

    const { color, opacity } = convertToFigmaColor(colorPart);
    const gradientColor = color;
    gradientColor.a = opacity;
    return {
      color: gradientColor,
      position: positionPart ? parseFloat(positionPart) / 100 : i / (arr.length - 1),
    };
  }) as ColorStop[];

  return {
    gradientStops,
    gradientTransform: [gradientTransformMatrix[0], gradientTransformMatrix[1]] as Transform,
  };
}
