import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

export function convertBoxShadowTypeToFigma(value: string) {
  switch (value) {
    case 'innerShadow':
      return 'INNER_SHADOW';
    case 'glass':
      return 'BACKGROUND_BLUR';
    default:
      return 'DROP_SHADOW';
  }
}

export function convertBoxShadowTypeFromFigma(value: string) {
  switch (value) {
    case 'INNER_SHADOW':
      return BoxShadowTypes.INNER_SHADOW;
    case 'BACKGROUND_BLUR':
      return BoxShadowTypes.GLASS;
    default:
      return BoxShadowTypes.DROP_SHADOW;
  }
}
