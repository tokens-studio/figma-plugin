export type TokenGradientColorObject = {
  colorSpace?: string;
  components?: number[];
  alpha?: number;
  hex?: string;
};

export type TokenGradientStop = {
  color: string | TokenGradientColorObject;
  position: number;
  midpoint?: number;
};

// Flat object discriminated by kind (linear, radial, conic, diamond),
// matching the Tokens Studio gradient registry schema.
export type TokenGradientValue = {
  kind: string;
  stops: TokenGradientStop[];
  interpolation?: string;
  angle?: number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  center?: { x: number; y: number };
  radius?: number;
  radiusY?: number;
  shape?: string;
  startAngle?: number;
  size?: number;
};
