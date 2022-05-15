import convertOpacityToFigma from './figmaTransforms/opacity';
import { convertTypographyNumberToFigma, fakeZeroForFigma } from './figmaTransforms/generic';
import { convertLetterSpacingToFigma } from './figmaTransforms/letterSpacing';
import { convertLineHeightToFigma } from './figmaTransforms/lineHeight';
import { convertBoxShadowTypeToFigma } from './figmaTransforms/boxShadow';
import { convertTextCaseToFigma } from './figmaTransforms/textCase';
import { convertTextDecorationToFigma } from './figmaTransforms/textDecoration';
import { UserIdProperty } from '@/figmaStorage';

export function generateId(len: number, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let randomString = '';
  for (let i = 0; i < len; i += 1) {
    const randomPoz = Math.floor(Math.random() * charSet.length);
    randomString += charSet.substring(randomPoz, randomPoz + 1);
  }
  return randomString;
}

export async function getUserId() {
  let userId = generateId(24);

  try {
    const id = await UserIdProperty.read();
    if (id === null) {
      await UserIdProperty.write(userId);
    } else {
      userId = id;
    }
  } catch (e) {
    console.error('error retrieving userId', e);
    await UserIdProperty.write(userId);
  }

  return userId;
}

export function transformValue(value: string, type: 'letterSpacing'): LetterSpacing | null;
export function transformValue(value: string, type: 'lineHeights'): LineHeight | null;
export function transformValue(value: string, type: 'boxShadowType'): ReturnType<typeof convertBoxShadowTypeToFigma>;
export function transformValue(value: string, type: 'textCase'): ReturnType<typeof convertTextCaseToFigma>;
export function transformValue(value: string, type: 'textDecoration'): ReturnType<typeof convertTextDecorationToFigma>;
export function transformValue(value: string, type: string): number;
export function transformValue(value: string, type: string) {
  switch (type) {
    case 'borderWidth':
    case 'width':
    case 'height':
    case 'sizing':
      return fakeZeroForFigma(convertTypographyNumberToFigma(value));
    case 'borderRadius':
    case 'borderRadiusTopLeft':
    case 'borderRadiusTopRight':
    case 'borderRadiusBottomRight':
    case 'borderRadiusBottomLeft':
    case 'spacing':
    case 'horizontalPadding':
    case 'verticalPadding':
    case 'paddingTop':
    case 'paddingRight':
    case 'paddingBottom':
    case 'paddingLeft':
    case 'itemSpacing':
    case 'paragraphSpacing':
    case 'fontSizes':
      return convertTypographyNumberToFigma(value);
    case 'letterSpacing':
      return convertLetterSpacingToFigma(value);
    case 'lineHeights':
      return convertLineHeightToFigma(value);
    case 'opacity':
      return convertOpacityToFigma(value.toString());
    case 'boxShadowType':
      return convertBoxShadowTypeToFigma(value);
    case 'textCase':
      return convertTextCaseToFigma(value.toString());
    case 'textDecoration':
      return convertTextDecorationToFigma(value.toString());
    default:
      return value;
  }
}
