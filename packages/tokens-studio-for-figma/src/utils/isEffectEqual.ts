import { isColorEqual } from './isColorEqual';

export function isEffectEqual(effect1?: Effect, effect2?: Effect) {
  if (effect1 && effect2) {
    if (effect1.type === effect2.type) {
      if (
        (effect1.type === 'DROP_SHADOW' && effect2.type === 'DROP_SHADOW')
        || (effect1.type === 'INNER_SHADOW' && effect2.type === 'INNER_SHADOW')
      ) {
        return (
          isColorEqual(effect1.color, effect2.color)
          && effect1.offset.x === effect2.offset.x
          && effect1.offset.y === effect2.offset.y
          && effect1.radius === effect2.radius
          && effect1.spread === effect2.spread
          && effect1.blendMode === effect2.blendMode
          // Figma Tokens doesn't store this effect subvalue (yet?) so omit from comparison:
          // && paint1.showShadowBehindNode === paint2.showShadowBehindNode
        );
      }
      if (
        (effect1.type === 'BACKGROUND_BLUR' && effect2.type === 'BACKGROUND_BLUR')
        || (effect1.type === 'LAYER_BLUR' && effect2.type === 'LAYER_BLUR')
      ) {
        return effect1.radius === effect2.radius;
      }
    }
  }
  return false;
}
