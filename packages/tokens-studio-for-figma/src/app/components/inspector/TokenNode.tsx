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
    <DropdownMenu.Item
      key={id}
      onSelect={onNodeSelect}
      css={{
        // Note: This is quite bad. We should not massacre a dropdown menu for it to be rendered as a context menu. let's think about introducing a dark version of our dropdown menu
        display: 'flex',
        color: '$contextMenuFg',
        padding: '$1 $4',
        '&:hover:not([data-disabled]), &:focus:not([data-disabled])': {
          backgroundColor: '$contextMenuBgHover',
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
    </DropdownMenu.Item>
  );
}
