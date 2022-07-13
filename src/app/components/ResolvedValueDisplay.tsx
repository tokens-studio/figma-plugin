import React from 'react';
import { SingleToken } from '@/types/tokens';
import { ResolvedShadowValueDisplay } from './ResolvedShadowValueDisplay';
import { ResolvedTypograhpyValueDisplay } from './ResolvedTypograhpyValueDisplay';
import { TokenBoxshadowValue, TokenTypograpyValue } from '@/types/values';
import Box from './Box';

type Props = {
  value: SingleToken['value'] | number | null;
  isColorToken: boolean;
};

export const ResolvedValueDisplay: React.FC<Props> = ({ value, isColorToken }) => {
  if (Array.isArray(value)) {
    return <ResolvedShadowValueDisplay shadows={value} />;
  }

  if (value && typeof value === 'object') {
    if ('fontFamily' in value) { // value is Typography value
      return <ResolvedTypograhpyValueDisplay value={value as TokenTypograpyValue} />;
    } if ('type' in value) { // value is BoxShadow value
      return <ResolvedShadowValueDisplay shadows={[value as TokenBoxshadowValue]} />;
    }
    return (
      <Box css={{
        display: 'flex', backgroundColor: '$bgSubtle', padding: '$4', fontSize: '$xsmall',
      }}
      >
        {JSON.stringify(value, null, 2)}
      </Box>
    );
  }

  return (
    <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
      {isColorToken ? (
        <div className="w-4 h-4 mr-1 border border-gray-200 rounded" style={{ background: String(value) }} />
      ) : null}
      {value}
    </div>
  );
};
