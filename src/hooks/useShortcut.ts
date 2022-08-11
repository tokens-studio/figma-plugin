import { useEffect } from 'react';
import { useKeys } from 'rooks';

const activeShortcuts: string[] = [];

export function useShortcut(keys: string[], action: () => void) {
  useKeys(keys, action, {
    preventLostKeyup: true,
  });

  useEffect(() => {
    const id = keys.join('+');
    if (activeShortcuts.includes(id)) {
      console.warn(`Duplicate shortcut registered: ${id}`);
    }

    activeShortcuts.push(id);

    return () => {
      const indexOf = activeShortcuts.indexOf(id);
      if (indexOf > -1) activeShortcuts.splice(indexOf, 1);
    };
  });
}
