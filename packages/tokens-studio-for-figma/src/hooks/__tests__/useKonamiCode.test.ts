import { renderHook, act } from '@testing-library/react';
import { useKonamiCode } from '../useKonamiCode';

const KONAMI_SEQUENCE = [
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

describe('useKonamiCode', () => {
  let callback: jest.Mock;

  beforeEach(() => {
    callback = jest.fn();
  });

  it('should call callback when correct sequence is entered', () => {
    renderHook(() => useKonamiCode(callback));

    act(() => {
      KONAMI_SEQUENCE.forEach((code) => {
        const event = new KeyboardEvent('keydown', { code });
        window.dispatchEvent(event);
      });
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not call callback when incorrect sequence is entered', () => {
    renderHook(() => useKonamiCode(callback));

    act(() => {
      ['ArrowUp', 'ArrowDown', 'KeyA'].forEach((code) => {
        const event = new KeyboardEvent('keydown', { code });
        window.dispatchEvent(event);
      });
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should reset sequence after successful detection', () => {
    renderHook(() => useKonamiCode(callback));

    // First sequence
    act(() => {
      KONAMI_SEQUENCE.forEach((code) => {
        const event = new KeyboardEvent('keydown', { code });
        window.dispatchEvent(event);
      });
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Second sequence
    act(() => {
      KONAMI_SEQUENCE.forEach((code) => {
        const event = new KeyboardEvent('keydown', { code });
        window.dispatchEvent(event);
      });
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should not interfere with input fields', () => {
    renderHook(() => useKonamiCode(callback));

    const input = document.createElement('input');
    document.body.appendChild(input);

    act(() => {
      KONAMI_SEQUENCE.forEach((code) => {
        const event = new KeyboardEvent('keydown', {
          code,
          bubbles: true,
        });
        Object.defineProperty(event, 'target', {
          value: input,
          writable: false,
        });
        window.dispatchEvent(event);
      });
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should not interfere with textarea fields', () => {
    renderHook(() => useKonamiCode(callback));

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    act(() => {
      KONAMI_SEQUENCE.forEach((code) => {
        const event = new KeyboardEvent('keydown', {
          code,
          bubbles: true,
        });
        Object.defineProperty(event, 'target', {
          value: textarea,
          writable: false,
        });
        window.dispatchEvent(event);
      });
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(textarea);
  });

  it('should not interfere with contenteditable elements', () => {
    renderHook(() => useKonamiCode(callback));

    const div = document.createElement('div');
    div.contentEditable = 'true';
    document.body.appendChild(div);

    act(() => {
      KONAMI_SEQUENCE.forEach((code) => {
        const event = new KeyboardEvent('keydown', {
          code,
          bubbles: true,
        });
        Object.defineProperty(event, 'target', {
          value: div,
          writable: false,
        });
        window.dispatchEvent(event);
      });
    });

    expect(callback).not.toHaveBeenCalled();

    document.body.removeChild(div);
  });

  it('should handle partial sequences correctly', () => {
    renderHook(() => useKonamiCode(callback));

    // Enter partial sequence
    act(() => {
      ['ArrowUp', 'ArrowUp', 'ArrowDown'].forEach((code) => {
        const event = new KeyboardEvent('keydown', { code });
        window.dispatchEvent(event);
      });
    });

    expect(callback).not.toHaveBeenCalled();

    // Complete with wrong key
    act(() => {
      const event = new KeyboardEvent('keydown', { code: 'KeyX' });
      window.dispatchEvent(event);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle sequence with extra keys in between', () => {
    renderHook(() => useKonamiCode(callback));

    act(() => {
      // Start the sequence
      ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'].forEach((code) => {
        const event = new KeyboardEvent('keydown', { code });
        window.dispatchEvent(event);
      });

      // Add a wrong key
      const wrongEvent = new KeyboardEvent('keydown', { code: 'KeyX' });
      window.dispatchEvent(wrongEvent);

      // Continue the sequence (but now it won't match)
      ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'].forEach((code) => {
        const event = new KeyboardEvent('keydown', { code });
        window.dispatchEvent(event);
      });
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should cleanup event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useKonamiCode(callback));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });
});
