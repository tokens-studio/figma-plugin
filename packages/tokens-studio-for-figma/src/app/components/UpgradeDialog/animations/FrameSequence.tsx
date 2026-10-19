import React, { useEffect, useState } from 'react';
import { styled } from '@/stitches.config';

// How long each storyboard frame stays on screen, and how long the cross-fade into the next one takes.
const FRAME_DURATION = 1600;
const FADE_DURATION = 400;

const StyledFrame = styled('img', {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  opacity: 0,
  transition: `opacity ${FADE_DURATION}ms ease-in-out`,
  variants: {
    visible: {
      true: { opacity: 1 },
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!query) return undefined;
    const handleChange = () => setReduced(query.matches);
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);
  return reduced;
}

// Plays a storyboard by cross-fading its frames on a loop; people who prefer reduced motion see the first frame only.
export default function FrameSequence({ frames }: { frames: string[] }) {
  const [current, setCurrent] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    setCurrent(0);
    if (frames.length < 2 || reducedMotion) return undefined;
    const interval = window.setInterval(() => setCurrent((index) => (index + 1) % frames.length), FRAME_DURATION);
    return () => window.clearInterval(interval);
  }, [frames, reducedMotion]);

  return (
    <>
      {frames.map((src, index) => (
        <StyledFrame
          key={src}
          src={src}
          alt=""
          aria-hidden
          visible={index === current}
          data-state={index === current ? 'visible' : 'hidden'}
        />
      ))}
    </>
  );
}
