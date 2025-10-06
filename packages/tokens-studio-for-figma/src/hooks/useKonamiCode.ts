import { useEffect, useRef, useCallback } from 'react';

const KONAMI_CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
];

export function useKonamiCode(callback: () => void) {
  const sequenceRef = useRef<string[]>([]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't interfere with keyboard events in input fields
    const target = event.target as HTMLElement;
    if (
      target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target.contentEditable === 'true'
    ) {
      return;
    }

    const { code } = event;

    // Add the key to the sequence
    sequenceRef.current = [...sequenceRef.current, code].slice(-KONAMI_CODE.length);

    // Check if the sequence matches the Konami Code
    const isMatch = sequenceRef.current.length === KONAMI_CODE.length
      && sequenceRef.current.every((key, index) => key === KONAMI_CODE[index]);

    if (isMatch) {
      sequenceRef.current = []; // Reset the sequence
      callback();
    }
  }, [callback]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
