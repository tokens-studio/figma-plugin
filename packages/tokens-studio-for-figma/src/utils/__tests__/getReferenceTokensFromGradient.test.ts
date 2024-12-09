import { getReferenceTokensFromGradient } from '../color';

describe('getReferenceTokensFromGradient', () => {
  const inputs = [
    'linear-gradient(212deg, {root} 0%, {dark} 100%)',
    'linear-gradient({root}, {dark})',
    'linear-gradient(0.25turn, {root}, {dark})',
    'linear-gradient(to top, {root}, {dark})',
    'linear-gradient(150deg, #555555 0%, {dark} 100%)',
    'linear-gradient(150deg, #555555 0%, #eeeeee 100%)',
    'linear-gradient(90deg, {root} 0%, {dark} 50%, #ff0000 100%)',
    'linear-gradient(90deg, {root} 0%, #ff0000 50%, {dark} 100%)',
    'linear-gradient(150deg, #555555, #eeeeee)',
  ];
  const outputs = [
    ['root', 'dark'],
    ['root', 'dark'],
    ['root', 'dark'],
    ['root', 'dark'],
    ['', 'dark'],
    ['', ''],
    ['root', 'dark', ''],
    ['root', '', 'dark'],
    ['', ''],
  ];
  it('should work', () => {
    expect(inputs.map(getReferenceTokensFromGradient)).toEqual(outputs);
  });
});
