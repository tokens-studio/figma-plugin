import React from 'react';
import { SingleTypographyToken } from '@/types/tokens';
import { ResolvedShadowValueDisplay } from './ResolvedShadowValueDisplay';
import { ResolvedTypograhpyValueDisplay } from './ResolvedTypograhpyValueDisplay';
import { TokenBoxshadowValue, TokenTypograpyValue } from '@/types/values';

type Props = {
  value: string | number | TokenTypograpyValue | TokenBoxshadowValue | TokenBoxshadowValue[] | null;
  isColorToken: boolean;
};

export const ResolvedValueDisplay: React.FC<Props> = ({ value, isColorToken }) => {
  if (Array.isArray(value)) {
    return <ResolvedShadowValueDisplay shadows={value as TokenBoxshadowValue[]} />;
  }

  if (value && typeof value === 'object') {
    if ('fontFamily' in value) { // value is Typography value
      return <ResolvedTypograhpyValueDisplay value={value as SingleTypographyToken['value']} />;
    } if ('type' in value) { // value is BoxShadow value
      return <ResolvedShadowValueDisplay shadows={[value as TokenBoxshadowValue]} />;
    }
    return (
      <div className="flex p-2 mt-2 font-mono text-gray-700 bg-gray-100 border-gray-300 rounded text-xxs itms-center">
        {JSON.stringify(value, null, 2)}
      </div>
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
