import { paintStyleMatchesColorToken } from './paintStyleMatchesColorToken';

describe('paintStyleMatchesColorToken', () => {
  // tslint:disable-next-line: no-empty
  const noop: () => void = () => {};
  const dummyFunc: <T>() => T = <T>() => (undefined as unknown) as T;
  const dummyFigmaPaintStyle: PaintStyle = {
    description: '',
    type: 'PAINT',
    paints: [],
    id: '',
    name: '',
    remove: noop,
    documentationLinks: [],
    remote: false,
    key: '',
    getPublishStatusAsync: () => dummyFunc<Promise<PublishStatus>>(),
    getPluginData: () => dummyFunc<string>(),
    setPluginData: noop,
    getPluginDataKeys: () => dummyFunc<string[]>(),
    getSharedPluginData: () => dummyFunc<string>(),
    setSharedPluginData: noop,
    getSharedPluginDataKeys: () => dummyFunc<string[]>(),
  };

  describe('when Figma paints is missing', () => {
    it('should return false when PaintStyle is undefined', () => {
      expect(paintStyleMatchesColorToken(undefined, 'rgb(255,255,255)')).toBe(false);
    });

    it('should return false when PaintStyle.paints is empty', () => {
      expect(paintStyleMatchesColorToken({ ...dummyFigmaPaintStyle, paints: [] }, 'rgb(255,255,255)')).toBe(false);
    });
  });

  describe('when using solid color token', () => {
    it('should match solid color token against same solid paint style', () => {
      const r = 100;
      const g = 150;
      const b = 200;
      const colorToken = `rgb(${r},${g},${b})`;
      const figmaRGB: RGB = { r: r / 255, g: g / 255, b: b / 255 };
      const figmaPaintStyle: PaintStyle = {
        ...dummyFigmaPaintStyle,
        paints: [{ color: figmaRGB, opacity: 1, type: 'SOLID' }],
      };
      expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(true);
    });

    it('should match solid color token with alpha against same solid paint style', () => {
      const r = 100;
      const g = 150;
      const b = 200;
      const a = 0.5;
      const colorToken = `rgb(${r},${g},${b},${a})`;
      const figmaRGB: RGB = { r: r / 255, g: g / 255, b: b / 255 };
      const figmaPaintStyle: PaintStyle = {
        ...dummyFigmaPaintStyle,
        paints: [{ color: figmaRGB, opacity: a, type: 'SOLID' }],
      };
      expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(true);
    });

    it('should NOT match solid color token against different solid paint style', () => {
      const colorToken = 'rgb(1,2,3)';
      const figmaRGB: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
      const figmaPaintStyle: PaintStyle = {
        ...dummyFigmaPaintStyle,
        paints: [{ color: figmaRGB, opacity: 1, type: 'SOLID' }],
      };
      expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(false);
    });

    it('should NOT match solid color token with alpha against different solid paint style', () => {
      const colorToken = 'rgb(1,2,3,0.5)';
      const figmaRGB: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
      const figmaPaintStyle: PaintStyle = {
        ...dummyFigmaPaintStyle,
        paints: [{ color: figmaRGB, opacity: 0.5, type: 'SOLID' }],
      };
      expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(false);
    });

    it('should NOT match solid color token with alpha against same solid paint style with different alpha', () => {
      const r = 100;
      const g = 150;
      const b = 200;
      const colorToken = `rgb(${r},${g},${b},0.5)`;
      const figmaRGB: RGB = { r: r / 255, g: g / 255, b: b / 255 };
      const figmaPaintStyle: PaintStyle = {
        ...dummyFigmaPaintStyle,
        paints: [{ color: figmaRGB, opacity: 0.75, type: 'SOLID' }],
      };
      expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(false);
    });
  });

  describe('when using gradient color token', () => {
    const figmaRGBToCss = (color: RGB) => Object.entries(color)
      .map(([key, value]) => (key === 'a' ? value : `${value * 255}`))
      .join(',');

    const colorStopToCss = (stop: ColorStop) => `rgba(${figmaRGBToCss(stop.color)}) ${stop.position * 100}%`;
    const colorStopsToCss = (stops: ReadonlyArray<ColorStop>) => stops.map(colorStopToCss).join(', ');

    describe('with gradient stops with same gradient color but different opacity', () => {
      it('should match 2 stops against same gradient paint style', () => {
        const gradientColor: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
        const gradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 0.5 } },
          { position: 1, color: { ...gradientColor, a: 1 } },
        ];
        const colorToken = `linear-gradient(90deg, ${colorStopsToCss(gradientStops)})`;
        const gradientTransform: Transform = [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const figmaPaintStyle: PaintStyle = {
          ...dummyFigmaPaintStyle,
          paints: [{ gradientTransform, gradientStops, type: 'GRADIENT_LINEAR' }],
        };

        expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(true);
      });

      it('should match 3 stops against same gradient paint style', () => {
        const gradientColor: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
        const gradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 0.5 } },
          { position: 0.5, color: { ...gradientColor, a: 0.75 } },
          { position: 1, color: { ...gradientColor, a: 1 } },
        ];
        const colorToken = `linear-gradient(90deg, ${colorStopsToCss(gradientStops)})`;
        const gradientTransform: Transform = [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const figmaPaintStyle: PaintStyle = {
          ...dummyFigmaPaintStyle,
          paints: [{ gradientTransform, gradientStops, type: 'GRADIENT_LINEAR' }],
        };

        expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(true);
      });
    });

    describe('with gradient stops with same opacity but different gradient colors', () => {
      it('should match 2 stops against same gradient paint style', () => {
        const gradientColor1: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
        const gradientColor2: RGB = { r: 150 / 255, g: 200 / 255, b: 250 / 255 };
        const gradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor1, a: 0.5 } },
          { position: 1, color: { ...gradientColor2, a: 0.5 } },
        ];
        const colorToken = `linear-gradient(90deg, ${colorStopsToCss(gradientStops)})`;
        const gradientTransform: Transform = [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const figmaPaintStyle: PaintStyle = {
          ...dummyFigmaPaintStyle,
          paints: [{ gradientTransform, gradientStops, type: 'GRADIENT_LINEAR' }],
        };

        expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(true);
      });

      it('should match 3 stops against same gradient paint style', () => {
        const gradientColor1: RGB = { r: 50 / 255, g: 10 / 255, b: 150 / 255 };
        const gradientColor2: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
        const gradientColor3: RGB = { r: 150 / 255, g: 200 / 255, b: 250 / 255 };
        const gradientStops: ReadonlyArray<ColorStop> = [
          { position: 0.25, color: { ...gradientColor1, a: 0.5 } },
          { position: 0.5, color: { ...gradientColor2, a: 0.5 } },
          { position: 0.75, color: { ...gradientColor3, a: 0.5 } },
        ];
        const colorToken = `linear-gradient(90deg, ${colorStopsToCss(gradientStops)})`;
        const gradientTransform: Transform = [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const figmaPaintStyle: PaintStyle = {
          ...dummyFigmaPaintStyle,
          paints: [{ gradientTransform, gradientStops, type: 'GRADIENT_LINEAR' }],
        };

        expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(true);
      });
    });

    describe('when gradient color token does not match gradient paint style', () => {
      it('should NOT match gradient color token against gradient paint style with different colors', () => {
        const gradientColor: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
        const gradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 0.5 } },
          { position: 1, color: { ...gradientColor, a: 1 } },
        ];
        const differentGradientColor: RGB = { r: 1 / 255, g: 2 / 255, b: 3 / 255 };
        const differentgradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...differentGradientColor, a: 0.5 } },
          { position: 1, color: { ...differentGradientColor, a: 1 } },
        ];
        const colorToken = `linear-gradient(90deg, ${colorStopsToCss(differentgradientStops)})`;
        const gradientTransform: Transform = [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const figmaPaintStyle: PaintStyle = {
          ...dummyFigmaPaintStyle,
          paints: [{ gradientTransform, gradientStops, type: 'GRADIENT_LINEAR' }],
        };

        expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(false);
      });

      it('should NOT match gradient color token against gradient paint style with different alpha', () => {
        const gradientColor: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
        const gradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 0.5 } },
          { position: 1, color: { ...gradientColor, a: 1 } },
        ];
        const differentgradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 1 } },
          { position: 1, color: { ...gradientColor, a: 0.5 } },
        ];
        const colorToken = `linear-gradient(90deg, ${colorStopsToCss(differentgradientStops)})`;
        const gradientTransform: Transform = [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const figmaPaintStyle: PaintStyle = {
          ...dummyFigmaPaintStyle,
          paints: [{ gradientTransform, gradientStops, type: 'GRADIENT_LINEAR' }],
        };

        expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(false);
      });

      it('should NOT match gradient color token against gradient paint style with more stops', () => {
        const gradientColor: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
        const gradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 0.25 } },
          { position: 0.5, color: { ...gradientColor, a: 0.5 } },
          { position: 1, color: { ...gradientColor, a: 0.75 } },
        ];
        const differentgradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 0.25 } },
          { position: 0.5, color: { ...gradientColor, a: 0.5 } },
        ];
        const colorToken = `linear-gradient(90deg, ${colorStopsToCss(differentgradientStops)})`;
        const gradientTransform: Transform = [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const figmaPaintStyle: PaintStyle = {
          ...dummyFigmaPaintStyle,
          paints: [{ gradientTransform, gradientStops, type: 'GRADIENT_LINEAR' }],
        };

        expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(false);
      });

      it('should NOT match gradient color token against gradient paint style with less stops', () => {
        const gradientColor: RGB = { r: 100 / 255, g: 150 / 255, b: 200 / 255 };
        const gradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 0.25 } },
          { position: 0.5, color: { ...gradientColor, a: 0.5 } },
        ];
        const differentgradientStops: ReadonlyArray<ColorStop> = [
          { position: 0, color: { ...gradientColor, a: 0.25 } },
          { position: 0.5, color: { ...gradientColor, a: 0.5 } },
          { position: 1, color: { ...gradientColor, a: 0.75 } },
        ];
        const colorToken = `linear-gradient(90deg, ${colorStopsToCss(differentgradientStops)})`;
        const gradientTransform: Transform = [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const figmaPaintStyle: PaintStyle = {
          ...dummyFigmaPaintStyle,
          paints: [{ gradientTransform, gradientStops, type: 'GRADIENT_LINEAR' }],
        };

        expect(paintStyleMatchesColorToken(figmaPaintStyle, colorToken)).toBe(false);
      });
    });
  });
});
