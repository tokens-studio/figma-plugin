import { Properties } from '@/constants/Properties';

export function performCodeGen(event: any): CodegenResult[] {
  const tokenKeys = Object.keys(Properties);

  const code = tokenKeys
    .map((key) => {
      let value = event.node.getSharedPluginData('tokens', key);
      if (key === 'fill' && !value) {
        if (event.node.fillStyleId) {
          value = figma.getStyleById(event.node.fillStyleId)?.getSharedPluginData('tokens', 'style');
        }
        if (event.node.boundVariables.fills) {
          // @ts-ignore next-line - waiting on the Figma plugin API to update
          value = figma.variables.getVariableById(event.node.boundVariables.fills[0].id)?.getSharedPluginData('tokens', 'tokenName');
        }
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
