import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { NodeInfo } from '@/types/NodeInfo';
import IconLayers from '@/icons/layers.svg';
import Box from '../Box';

// export default () => (
//   <Popover.Root>
//     <Popover.Trigger />
//     <Popover.Content>
//      test
//     </Popover.Content>
//   </Popover.Root>
// );

export default function TokenNodes({ nodes }: { nodes: NodeInfo[] }) {
  return (
    <Popover.Root>
      <Box
        css={{
          display: 'flex',
          alignItems: 'center',
          gap: '$3',
          fontWeight: '$bold',
          fontSize: '$small',
        }}
      >
        <Popover.Trigger>
          <Box css={{ color: '$fgSubtle', cursor: 'pointer' }}>
            <IconLayers />
          </Box>
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Arrow offset={4} />
          <Box
            css={{
              background: 'black',
              color: 'white',
              borderRadius: '$card',
              padding: '$4',
              fontSize: '$small',
            }}
          >
            <ul>
              {nodes.map((node) => (
                <li>{node.name}</li>
              ))}
            </ul>
          </Box>
        </Popover.Content>
        {nodes.length}
      </Box>
    </Popover.Root>
  );
}
