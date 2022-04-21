import React from 'react';
import { getAliasValue } from '@/utils/alias';
import { ResolveTokenValuesResult } from '@/plugin/tokenHelpers';
import { findReferences } from '../../utils/findReferences';
import Box from './Box';
import AliasBox from './AliasBox';

export default function ResolvedValueBox({
  alias,
  resolvedTokens,
}: {
  alias: string;
  resolvedTokens: ResolveTokenValuesResult[];
}) {
  const resolvedValue = React.useMemo(() => {
    if (alias) {
      return typeof alias === 'object'
        ? null
        : getAliasValue(alias, resolvedTokens);
    }
    return null;
  }, [alias, resolvedTokens]);

  const isJson = (str) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  return (
    <Box css={{
      display: 'flex', flexDirection: 'column', gap: '$2',
    }}
    >
      {
        (resolvedValue && isJson(resolvedValue)) ? (
          (resolvedValue?.toString().charAt(0) === '[') ? (
            <AliasBox>
              <Box css={{ display: 'grid', margin: '12px', marginRight: '60px' }}>
                {
                  findReferences(resolvedValue).map((value, index) => <p>{index + 1}</p>)
                }
              </Box>
              <Box css={{ display: 'grid', margin: '12px' }}>
                {
                  findReferences(resolvedValue).map((value, index) => {
                    let properties = '';
                    for (const key in JSON.parse(value)) {
                      const element = JSON.parse(value)[key];
                      properties += `${key}` + ':' + `${element}` + '        ';
                    }
                    return <p>{properties}</p>;
                  })
                }
              </Box>
            </AliasBox>

          ) : (
            <AliasBox>
              <Box css={{ display: 'grid', margin: '12px', marginRight: '60px' }}>
                {
                  Object.keys(JSON.parse(resolvedValue)).map((key, index) => <p>{key}</p>)
                }
              </Box>
              <Box css={{ display: 'grid', margin: '12px' }}>
                {
                  Object.keys(JSON.parse(resolvedValue)).map((key) => <p>{JSON.parse(resolvedValue)[key]}</p>)
                }
              </Box>
            </AliasBox>
          )
        ) : (
          <AliasBox>
            {resolvedValue}
          </AliasBox>
        )
      }
    </Box>
  );
}
