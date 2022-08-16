import { useEffect } from 'react';
import { useKeys } from 'rooks';

export const activeShortcuts: string[] = [];

export function useShortcut(keys: string[], action: (event: KeyboardEvent) => void) {
  useKeys(keys, action, {
    preventLostKeyup: true,
  });

  useEffect(() => {
    const id = keys.join('+');
    if (activeShortcuts.includes(id)) {
      console.warn(`Possibly duplicate shortcut registered: ${id}`);
    }

    activeShortcuts.push(id);

    return () => {
      const indexOf = activeShortcuts.indexOf(id);
      if (indexOf > -1) activeShortcuts.splice(indexOf, 1);
    };
  });
}
