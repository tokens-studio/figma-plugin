import { getDegreesForMatrix, getMatrixForDegrees } from './matrix';

const deg45Matrix = [
  [0.71, 0.71, 0],
  [-0.71, 0.71, 0],
];

const deg0Matrix = [
  [1, 0, 0],
  [-0, 1, 0],
];

const deg45NegMatrix = [
  [0.71, -0.71, 0],
  [0.71, 0.71, 0],
];

describe('matrix', () => {
  it('returns a matrix for degrees', async () => {
    const deg0 = {
      input: 0,
      output: deg0Matrix,
    };
    const deg45 = {
      input: 45,
      output: deg45Matrix,
    };
    const deg45Neg = {
      input: -45,
      output: deg45NegMatrix,
    };

    expect(getMatrixForDegrees(deg0.input)).toEqual(deg0.output);
    expect(getMatrixForDegrees(deg45.input)).toEqual(deg45.output);
    expect(getMatrixForDegrees(deg45Neg.input)).toEqual(deg45Neg.output);
  });

  it('returns degrees for a matrix', async () => {
    const deg0 = {
      input: deg0Matrix,
      output: '0deg',
    };
    const deg45 = {
      input: deg45Matrix,
      output: '45deg',
    };
    const deg45Neg = {
      input: deg45NegMatrix,
      output: '315deg',
    };

    expect(getDegreesForMatrix(deg0.input)).toEqual(deg0.output);
    expect(getDegreesForMatrix(deg45.input)).toEqual(deg45.output);
    expect(getDegreesForMatrix(deg45Neg.input)).toEqual(deg45Neg.output);
  });
});
