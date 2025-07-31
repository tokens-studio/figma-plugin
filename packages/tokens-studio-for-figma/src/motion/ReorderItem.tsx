import {
  Box, HTMLMotionProps, isMotionValue, motion, PanInfo, useMotionValue, useTransform,
} from 'framer-motion';
import * as React from 'react';
import {
  useContext,
  useEffect,
  useRef,
} from 'react';
import { ReorderContext } from '@/context';

export interface Props<V> {
  value: V
  layout?: true | 'position'
}

function useDefaultMotionValue(value: any, defaultValue: number = 0) {
  // eslint complains about hook order
  // eslint-disable-next-line
  return isMotionValue(value) ? value : useMotionValue(defaultValue);
}

export function ReorderItem<V>(
  {
    children,
    style,
    value,
    onDrag,
    layout = true,
    ...props
  }: Props<V> & HTMLMotionProps<any> & React.PropsWithChildren<unknown>,
) {
  const Component = motion.li;

  const context = useContext(ReorderContext);
  const { axis, registerItem, updateOrder } = context!;

  const point = {
    x: useDefaultMotionValue(style?.x),
    y: useDefaultMotionValue(style?.y),
  };

  const zIndex = useTransform([point.x, point.y], ([latestX, latestY]) => (latestX || latestY ? 1 : 'unset'));

  const measuredLayout = useRef<Box | null>(null);

  const handleDrag = React.useCallback((event: MouseEvent | TouchEvent | PointerEvent, gesturePoint: PanInfo) => {
    const { velocity } = gesturePoint;
    if (velocity[axis]) {
      updateOrder(value, point[axis].get(), velocity[axis]);
    }
    onDrag?.(event, gesturePoint);
  }, [axis, point, value, updateOrder, onDrag]);

  const handleLayoutMeasure = React.useCallback((measured: Box) => {
    measuredLayout.current = measured;
  }, []);

  useEffect(() => {
    registerItem(value, measuredLayout.current!);
  }, [context]);

  return (
    <Component
      drag={axis}
      {...props}
      dragSnapToOrigin
      style={{
        ...style,
        x: point.x,
        y: point.y,
        zIndex,
        transform: 'none',
      }}
      layout={layout}
      onDrag={handleDrag}
      onLayoutMeasure={handleLayoutMeasure}
    >
      {children}
    </Component>
  );
}
