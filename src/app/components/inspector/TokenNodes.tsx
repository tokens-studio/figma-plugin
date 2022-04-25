import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Crosshair2Icon } from '@radix-ui/react-icons';
import Box from '../Box';
import IconLayers from '@/icons/layers.svg';
import { selectNodes } from '@/utils/figma/selectNodes';
import { NodeInfo } from '@/types/NodeInfo';
import TokenNode from './TokenNode';
import IconButton from '../IconButton';

const NODE_HEIGHT = 22;
const VISIBLE_VIEWPORT_NODES = 10;
const CONTAINER_PADDING = 8;

export default function TokenNodes({ nodes }: { nodes: NodeInfo[] }) {
  function selectAllNodes() {
    const nodeIds = nodes.map(({ id }) => id);
    selectNodes(nodeIds);
  }

  const dropdownContent = (
    <DropdownMenu.Content sideOffset={4}>
      <DropdownMenu.Arrow offset={14} />
      <Box
        css={{
          width: '164px',
          background: '$contextMenuBackground',
          borderRadius: '$contextMenu',
          padding: '$2 0',
          fontSize: '$small',
          maxHeight: `${VISIBLE_VIEWPORT_NODES * NODE_HEIGHT + CONTAINER_PADDING}px`,
        }}
        className={`content content-dark ${nodes.length > VISIBLE_VIEWPORT_NODES ? 'scroll-container' : null}`}
      >
        {nodes.map(({ id, name, type }) => (
          <TokenNode key={id} id={id} name={name} type={type} />
        ))}
      </Box>
    </DropdownMenu.Content>
  );

  return (
    <Box
      css={{
        display: 'flex',
      }}
    >
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
                borderRadius: '$default',
                cursor: 'pointer',
                transition: 'background 200ms ease',
                '&:hover': {
                  background: '$bgSubtle',
                },
              }}
            >
              <Box css={{ color: '$fgSubtle', marginRight: '$3' }}>
                <IconLayers />
              </Box>
              <Box css={{ color: '$textMuted' }}>{nodes.length}</Box>
            </Box>
          </DropdownMenu.Trigger>
          {dropdownContent}
        </Box>
      </DropdownMenu.Root>
      <IconButton
        tooltip="Select all"
        tooltipSide="bottom"
        onClick={selectAllNodes}
        css={{
          marginLeft: '$4',
        }}
        icon={<Crosshair2Icon />}
      />
    </Box>
  );
}
