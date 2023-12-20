import React, { useCallback } from 'react';
import { DropdownMenu } from '@tokens-studio/ui';
import NodeIcon from './NodeIcon';
import Box from '../Box';
import { goToNodeId } from '@/utils/figma';
import { NodeInfo } from '@/types/NodeInfo';

export default function TokenNode({ id, name, type }: NodeInfo) {
  const onNodeSelect = useCallback(() => {
    goToNodeId(id);
  }, [id]);

  return (
    <DropdownMenu.Item key={id} onSelect={onNodeSelect}>
      <Box
        css={{
          display: 'flex',
          color: '$contextMenuFg',
          cursor: 'pointer',
          padding: '$1 $4',
          '&:hover': {
            backgroundColor: '$accentDefault',
            color: '$fgOnEmphasis',
          },
        }}
      >
        <NodeIcon type={type} />
        <Box
          css={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={name}
        >
          {name}
        </Box>
      </Box>
    </DropdownMenu.Item>
  );
}
