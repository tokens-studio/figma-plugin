export function getShadowBehindNodeFromEffect(effect: Effect) {
  if (!effect) return false;
  if (effect.type === 'DROP_SHADOW') {
    return effect.showShadowBehindNode;
  }
  return false;
}
