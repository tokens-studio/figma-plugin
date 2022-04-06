import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Box from '../Box';
import IconLayers from '@/icons/layers.svg';
import getNodeIcon from './getNodeIcon';
import { goToNodeId } from '../utils';
import { NodeInfo } from '@/types/NodeInfo';

const NODE_HEIGHT = 22;
const VISIBLE_VIEWPORT_NODES = 10;
const CONTAINER_PADDING = 8;

export default function TokenNodes({ nodes }: { nodes: NodeInfo[] }) {
  function getNode({ id, name, type }: NodeInfo) {
    return (
      <DropdownMenu.Item key={id} onClick={() => goToNodeId(id)}>
        <Box
          css={{
            display: 'flex',
            color: '#fff',
            cursor: 'pointer',
            padding: '$1 $4',
            '&:hover': {
              backgroundColor: '$interaction',
            },
          }}
        >
          {getNodeIcon(type)}
          <span>{name}</span>
        </Box>
      </DropdownMenu.Item>
    );
  }

  const dropdownContent = (
    <DropdownMenu.Content sideOffset={4}>
      <DropdownMenu.Arrow offset={14} />
      <Box
        css={{
          minWidth: '164px',
          background: '$contextMenuBackground',
          borderRadius: '$contextMenu',
          padding: '$2 0',
          fontSize: '$small',
          maxHeight: `${VISIBLE_VIEWPORT_NODES * NODE_HEIGHT + CONTAINER_PADDING}px`,
        }}
        className={`content ${nodes.length > VISIBLE_VIEWPORT_NODES ? 'scroll-container' : null}`}
      >
        {nodes.map(getNode)}
      </Box>
    </DropdownMenu.Content>
  );

  return (
    <DropdownMenu.Root>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '$3',
          fontWeight: '$bold',
          fontSize: '$small',
        }}
      >
        <DropdownMenu.Trigger>
          <Box
            css={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '$2 $3',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background 200ms ease',
              '&:hover': {
                background: 'rgba(196, 196, 196, 0.15)',
              },
            }}
          >
            <Box css={{ color: '$fgSubtle', marginRight: '$3' }}>
              <IconLayers />
            </Box>
            <Box css={{ color: '#575757' }}>{nodes.length}</Box>
          </Box>
        </DropdownMenu.Trigger>
        {dropdownContent}
      </Box>
    </DropdownMenu.Root>
  );
}
