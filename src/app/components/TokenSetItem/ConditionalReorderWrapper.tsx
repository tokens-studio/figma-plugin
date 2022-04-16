import React from 'react';
import { DragControls, Reorder, useMotionValue } from 'framer-motion';
import { useRaisedShadow } from '../use-raised-shadow';
import type { TreeItem } from '../utils/getTree';
import type { ListItem } from './TokenSetItem';

type Props = {
  canReorder: boolean;
  controls: DragControls;
  item: TreeItem | ListItem;
  children: React.ReactElement;
  onReorder?: () => void;
};

export const ConditionalReorderWrapper: React.FC<Props> = ({
  canReorder,
  controls,
  item,
  children,
  onReorder,
}) => {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  return (canReorder && onReorder) ? (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      onDragEnd={(e) => {
        onReorder();
        e.preventDefault();
      }}
      value={item}
      style={{ boxShadow, y }}
    >
      {children}
    </Reorder.Item>
  ) : (
    children
  );
};
