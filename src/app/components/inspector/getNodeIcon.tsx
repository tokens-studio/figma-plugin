import React from 'react';
import {
  ComponentInstanceIcon,
  FrameIcon,
  TextIcon,
  MixIcon,
  GroupIcon,
  BoxIcon,
  MinusIcon,
  ValueIcon,
} from '@radix-ui/react-icons';
import Box from '../Box';

function getNodeIcon(type: NodeType) {
  let icon;
  switch (type) {
    case 'TEXT':
      icon = <TextIcon />;
      break;
    case 'FRAME':
      icon = <FrameIcon />;
      break;
    case 'INSTANCE':
      icon = <ComponentInstanceIcon />;
      break;
    case 'VECTOR':
      icon = <MixIcon />;
      break;
    case 'GROUP':
      icon = <GroupIcon />;
      break;
    case 'RECTANGLE':
      icon = <BoxIcon />;
      break;
    case 'LINE':
      icon = <MinusIcon />;
      break;
    case 'ELLIPSE':
      icon = <ValueIcon />;
      break;
    default:
      break;
  }
  return (
    icon && (
      <Box
        css={{
          marginRight: '$4',
          svg: {
            fill: '#fff',
          },
        }}
      >
        {icon}
      </Box>
    )
  );
}

export default getNodeIcon;
