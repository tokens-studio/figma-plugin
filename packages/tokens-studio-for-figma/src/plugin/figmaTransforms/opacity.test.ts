import convertOpacityToFigma from './opacity';

describe('convertOpacityToFigma', () => {
  it('converts opacity input to figma readable output', () => {
    const opacityPercent = convertOpacityToFigma('50%');
    expect(opacityPercent).toBe(0.5);
    const opacityNumber = convertOpacityToFigma('0.3');
    expect(opacityNumber).toBe(0.3);
  });

  it('should convert to variables output if needed', () => {
    const opacityPercent = convertOpacityToFigma('50%', true);
    expect(opacityPercent).toBe(50);
    const opacityNumber = convertOpacityToFigma('0.3', true);
    expect(opacityNumber).toBe(30);
  });
});
