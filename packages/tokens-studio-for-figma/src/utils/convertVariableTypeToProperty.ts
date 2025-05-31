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
    case 'strokeWeight':
      return 'borderWidth' as Properties;
    case 'strokeTopWeight':
      return 'borderWidthTop' as Properties;
    case 'strokeRightWeight':
      return 'borderWidthRight' as Properties;
    case 'strokeBottomWeight':
      return 'borderWidthBottom' as Properties;
    case 'strokeLeftWeight':
      return 'borderWidthLeft' as Properties;
    default:
      return variableType as Properties;
  }
}
