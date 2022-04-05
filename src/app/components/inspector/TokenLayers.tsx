import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Box from '../Box';
import { styled } from '@/stitches.config';
import IconLayers from '@/icons/layers.svg';
import getNodeIcon from './getNodeIcon';
import { goToNodeId } from '../utils';
import { NodeInfo } from '@/types/NodeInfo';

const StyledDropdownItem = styled(DropdownMenu.Item, {
  cursor: 'pointer',
  borderRadius: '$contextMenuItem',
  padding: '$2 $4',
  '&:hover': {
    background: '#1C99FC',
    color: '#fff',
  },
});

export default function TokenNodes({ nodes }: { nodes: NodeInfo[] }) {
  function getNode({ id, name, type }: NodeInfo) {
    return (
      <StyledDropdownItem key={id} onClick={() => goToNodeId(id)}>
        <Box
          css={{
            display: 'flex',
          }}
        >
          {getNodeIcon(type)}
          <span>{name}</span>
        </Box>
      </StyledDropdownItem>
    );
  }

  const dropdownContent = (
    <DropdownMenu.Content>
      <DropdownMenu.Arrow offset={14} />
      <Box
        css={{
          minWidth: '164px',
          background: '#222222',
          color: 'white',
          borderRadius: '$contextMenu',
          padding: '$2 0',
          fontSize: '$small',
        }}
        className="content"
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
            <Box css={{ color: 'black', cursor: '#545454' }}>{nodes.length}</Box>
          </Box>
        </DropdownMenu.Trigger>
        {dropdownContent}
      </Box>
    </DropdownMenu.Root>
  );
}
