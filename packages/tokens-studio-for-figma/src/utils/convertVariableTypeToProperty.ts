import { Properties } from '@/constants/Properties';

export default function convertVariableTypeToProperty(variableType: string): Properties {
  switch (variableType) {
    case 'visible':
      return 'visibility' as Properties;
    case 'topLeftRadius':
      return 'borderRadiusTopLeft' as Properties;
    case 'topRightRadius':
      return 'borderRadiusTopRight' as Properties;
    case 'bottomLeftRadius':
      return 'borderRadiusBottomLeft' as Properties;
    case 'bottomRightRadius':
      return 'borderRadiusBottomRight' as Properties;
    default:
      return variableType as Properties;
  }
}
