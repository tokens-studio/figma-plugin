import { TokenCubicBezierValue } from './TokenCubicBezierValue';
import { TokenDurationValue } from './TokenDurationValue';

export type TokenMotionValue = {
  property?: string;
  duration: string | TokenDurationValue;
  timingFunction: string | TokenCubicBezierValue;
  delay?: string | TokenDurationValue;
};
