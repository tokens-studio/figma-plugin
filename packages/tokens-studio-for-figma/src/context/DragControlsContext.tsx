import { createContext } from 'react';
import type { DragControls } from 'framer-motion';

type ContextValue = {
  controls: DragControls | null
};

export const DragControlsContext = createContext<ContextValue>({
  controls: null,
});
