import { BoxShadowTypes } from '@/constants/BoxShadowTypes';

export function convertBoxShadowTypeToFigma(value: string) {
  switch (value) {
    case 'innerShadow':
      return 'INNER_SHADOW';
    default:
      return 'DROP_SHADOW';
  }
}

export function convertBoxShadowTypeFromFigma(value: string) {
  switch (value) {
    case 'INNER_SHADOW':
      return BoxShadowTypes.INNER_SHADOW;
    default:
      return BoxShadowTypes.DROP_SHADOW;
  }
}
