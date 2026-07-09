import React from 'react';
import { styled } from '@/stitches.config';
import { TokenGradientStop } from '@/types/values';

// Interactive gradient preview bar with draggable stop thumbs, ported from
// Studio's GradientStopBar.vue. Drag a thumb to reposition a stop, click the
// bar to add a stop, click a thumb to select it.

const StyledTrack = styled('div', {
  position: 'relative',
  height: '28px',
  borderRadius: '$small',
  cursor: 'pointer',
});

const StyledCheckerboard = styled('div', {
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
  backgroundImage: 'repeating-conic-gradient($colors$borderMuted 0% 25%, transparent 0% 50%)',
  backgroundSize: '8px 8px',
});

const StyledTrackFill = styled('div', {
  position: 'absolute',
  inset: 0,
  borderRadius: 'inherit',
});

const StyledThumb = styled('button', {
  position: 'absolute',
  top: '50%',
  width: '18px',
  height: '18px',
  transform: 'translate(-50%, -50%)',
  border: 'none',
  background: 'none',
  padding: 0,
  cursor: 'grab',
  zIndex: 1,
  '&:active': {
    cursor: 'grabbing',
    zIndex: 2,
  },
  variants: {
    selected: {
      true: {
        zIndex: 3,
      },
    },
  },
});

const StyledThumbInner = styled('span', {
  display: 'block',
  width: '18px',
  height: '18px',
  borderRadius: '$full',
  border: '2px solid $fgMuted',
  backgroundColor: 'var(--thumbColor)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  variants: {
    selected: {
      true: {
        borderColor: '$accentDefault',
        boxShadow: '0 0 0 2px $colors$accentDefault, 0 1px 3px rgba(0, 0, 0, 0.3)',
      },
    },
  },
});

type Props = {
  stops: TokenGradientStop[];
  selectedIndex: number;
  // Pre-computed CSS color strings per stop, so references render resolved
  cssColors: string[];
  onSelectStop: (index: number) => void;
  onStopPositionChange: (index: number, position: number) => void;
  onAddStop: (position: number) => void;
};

export default function GradientStopBar({
  stops,
  selectedIndex,
  cssColors,
  onSelectStop,
  onStopPositionChange,
  onAddStop,
}: Props) {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const latestOnStopPositionChange = React.useRef(onStopPositionChange);
  const activeDragCleanup = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    latestOnStopPositionChange.current = onStopPositionChange;
  }, [onStopPositionChange]);

  // Remove document listeners if the component unmounts mid-drag
  React.useEffect(() => () => activeDragCleanup.current?.(), []);

  const gradientCss = React.useMemo(() => {
    if (stops.length === 0) return 'transparent';
    const sorted = stops
      .map((stop, index) => ({ position: stop.position, css: cssColors[index] ?? '#000' }))
      .sort((a, b) => a.position - b.position);
    return `linear-gradient(to right, ${sorted.map((s) => `${s.css} ${s.position * 100}%`).join(', ')})`;
  }, [stops, cssColors]);

  const positionFromEvent = React.useCallback((event: PointerEvent | React.PointerEvent) => {
    if (!trackRef.current) return null;
    const rect = trackRef.current.getBoundingClientRect();
    if (rect.width === 0) return null;
    const position = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    return Math.round(position * 1000) / 1000;
  }, []);

  const onThumbPointerDown = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    activeDragCleanup.current?.();
    const index = Number((event.currentTarget as HTMLButtonElement).dataset.index);
    onSelectStop(index);

    const handleMove = (moveEvent: PointerEvent) => {
      const position = positionFromEvent(moveEvent);
      if (position !== null) {
        latestOnStopPositionChange.current(index, position);
      }
    };
    const handleUp = () => activeDragCleanup.current?.();

    activeDragCleanup.current = () => {
      document.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerup', handleUp);
      activeDragCleanup.current = null;
    };
    document.addEventListener('pointermove', handleMove);
    document.addEventListener('pointerup', handleUp);
  }, [onSelectStop, positionFromEvent]);

  const onTrackPointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    // Thumb clicks are stopped in their own handler, so this only fires for
    // clicks directly on the track background.
    const position = positionFromEvent(event);
    if (position !== null) {
      onAddStop(position);
    }
  }, [positionFromEvent, onAddStop]);

  return (
    <StyledTrack ref={trackRef} onPointerDown={onTrackPointerDown} data-testid="gradient-stop-bar">
      <StyledCheckerboard />
      <StyledTrackFill style={{ background: gradientCss }} />
      {stops.map((stop, index) => (
        <StyledThumb
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          type="button"
          data-index={index}
          selected={index === selectedIndex}
          style={{ left: `${stop.position * 100}%`, '--thumbColor': cssColors[index] ?? '#000' } as React.CSSProperties}
          aria-label={`Color stop ${index + 1} at ${Math.round(stop.position * 100)}%`}
          onPointerDown={onThumbPointerDown}
        >
          <StyledThumbInner selected={index === selectedIndex} />
        </StyledThumb>
      ))}
    </StyledTrack>
  );
}
