import { Properties } from '@/constants/Properties';

export function performCodeGen(event: any): CodegenResult[] {
  const tokenKeys = Object.keys(Properties);

  const code = tokenKeys
    .map((key) => {
      const value = event.node.getSharedPluginData('tokens', key);

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
