export default async function setLineHeightValuesOnTarget(target: TextNode | TextStyle, transformedValue: LineHeight) {
  try {
    target.lineHeight = transformedValue;
  } catch (e) {
    console.error('Error setting data on node', e);
  }
}
