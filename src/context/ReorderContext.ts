/** Adapted from framer-motion */
import { createContext } from 'react';
import type { Axis, Box } from 'framer-motion';

export interface ReorderContextProps<T> {
  axis: 'x' | 'y'
  registerItem: (id: T, layout: Box) => void
  updateOrder: (id: T, offset: number, velocity: number) => void
}

export interface ItemData<T> {
  value: T
  layout: Axis
}

export const ReorderContext = createContext<ReorderContextProps<any> | null>(
  null,
);
