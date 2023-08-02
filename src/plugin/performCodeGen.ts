import { Properties } from '@/constants/Properties';

export function performCodeGen(event: any): CodegenResult[] {
  const tokenKeys = Object.keys(Properties);

  const code = tokenKeys
    .map((key) => {
      let value = event.node.getSharedPluginData('tokens', key);

      if (key === 'fill' && !value && event.node.fillStyleId) {
        value = figma.getStyleById(event.node.fillStyleId)?.getSharedPluginData('tokens', 'style');
      }
      return value && `${key}: ${value};`;
    })
    .filter((x) => x)
    .join('\n');

  return [
    {
      language: 'CSS',
      code: code === '' ? '/* No tokens found */' : code,
      title: 'Applied tokens (Tokens Studio)',
    },
  ];
}
