import React, { useCallback } from 'react';
import { Crosshair2Icon } from '@radix-ui/react-icons';
import {
  DropdownMenu, Stack, Button, IconButton,
} from '@tokens-studio/ui';
import Box from '../Box';
import IconLayers from '@/icons/layers.svg';
import { selectNodes } from '@/utils/figma/selectNodes';
import { NodeInfo } from '@/types/NodeInfo';
import TokenNode from './TokenNode';

const NODE_HEIGHT = 22;
const VISIBLE_VIEWPORT_NODES = 10;
const CONTAINER_PADDING = 8;

export default function TokenNodes({ nodes }: { nodes: NodeInfo[] }) {
  const selectAllNodes = useCallback(() => {
    const nodeIds = nodes.map(({ id }) => id);
    selectNodes(nodeIds);
  }, [nodes]);

  const dropdownContent = (
    <DropdownMenu.Content sideOffset={4}>
      <DropdownMenu.Arrow offset={14} />
      <Box
        css={{
          width: '164px',
          background: '$contextMenuBg',
          borderRadius: '$medium',
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
    <Stack
      align="center"
      gap={1}
    >
      <DropdownMenu>
        <Box
          css={{
            display: 'flex',
            alignItems: 'center',
            gap: '$3',
            fontWeight: '$sansBold',
            fontSize: '$small',
          }}
        >
          <DropdownMenu.Trigger asChild>
            <Button variant="invisible" size="small" icon={<IconLayers />}>
              {nodes.length}
            </Button>
          </DropdownMenu.Trigger>
          {dropdownContent}
        </Box>
      </DropdownMenu>
      <IconButton
        tooltip="Select all"
        tooltipSide="bottom"
        onClick={selectAllNodes}
        variant="invisible"
        size="small"
        icon={<Crosshair2Icon />}
      />
    </Stack>
  );
}
