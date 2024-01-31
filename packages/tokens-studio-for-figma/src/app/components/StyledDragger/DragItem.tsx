import React, { useMemo } from 'react';
import { useDragControls, useMotionValue } from 'framer-motion';
import { useSelector } from 'react-redux';
import { editProhibitedSelector } from '@/selectors';
import { DragControlsContext } from '@/context';
import { ReorderItem } from '@/motion/ReorderItem';
import { useRaisedShadow } from '../use-raised-shadow';

type Props<T> = React.PropsWithChildren<{
  item: T;
}>;

export function DragItem<T>({ item, children }: Props<T>) {
  const y = useMotionValue(0);
  const boxShadow = useRaisedShadow(y);
  const controls = useDragControls();
  const editProhibited = useSelector(editProhibitedSelector);
  const contextValue = useMemo(() => ({ controls }), [controls]);

  return (!editProhibited)
    ? (
      <DragControlsContext.Provider value={contextValue}>
        <ReorderItem
          dragListener={false}
          dragControls={controls}
          value={item}
          style={{ boxShadow, y }}
        >
          {children}
        </ReorderItem>
      </DragControlsContext.Provider>
    )
    : React.createElement(React.Fragment, {}, children);
}
