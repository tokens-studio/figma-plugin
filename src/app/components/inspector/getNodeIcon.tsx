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

const SVG_WIDTH = 12;
const SVG_HEIGHT = 12;

function getNodeIcon(type: NodeType) {
  let icon;
  switch (type) {
    case 'TEXT':
      icon = <TextIcon width={SVG_WIDTH} height={SVG_HEIGHT} />;
      break;
    case 'FRAME':
      icon = <FrameIcon width={SVG_WIDTH} height={SVG_HEIGHT} />;
      break;
    case 'INSTANCE':
      icon = <ComponentInstanceIcon width={SVG_WIDTH} height={SVG_HEIGHT} />;
      break;
    case 'VECTOR':
      icon = <MixIcon width={SVG_WIDTH} height={SVG_HEIGHT} />;
      break;
    case 'GROUP':
      icon = <GroupIcon width={SVG_WIDTH} height={SVG_HEIGHT} />;
      break;
    case 'RECTANGLE':
      icon = <BoxIcon width={SVG_WIDTH} height={SVG_HEIGHT} />;
      break;
    case 'LINE':
      icon = <MinusIcon width={SVG_WIDTH} height={SVG_HEIGHT} />;
      break;
    case 'ELLIPSE':
      icon = <ValueIcon width={SVG_WIDTH} height={SVG_HEIGHT} />;
      break;
    default:
      break;
  }
  return (
    icon && (
      <Box
        css={{
          marginRight: '$3',
          display: 'flex',
          alignItems: 'center',
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
