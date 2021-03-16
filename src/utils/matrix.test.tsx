import {getDegreesForMatrix, getMatrixForDegrees} from './matrix';

describe('updateCredentials', () => {
    it('returns a matrix for degrees', async () => {
        const deg0 = {
            input: 0,
            output: [
                [1, 0, 0],
                [1, 0, 0],
            ],
        };
        const deg45 = {
            input: 45,
            output: [
                [0.71, 0.71, -0.71],
                [0.71, 0, 0],
            ],
        };
        const deg45Neg = {
            input: -45,
            output: [
                [0.71, -0.71, 0.71],
                [0.71, 0, 0],
            ],
        };

        expect(getMatrixForDegrees(deg0.input)).toEqual(deg0.output);
        expect(getMatrixForDegrees(deg45.input)).toEqual(deg45.output);
        expect(getMatrixForDegrees(deg45Neg.input)).toEqual(deg45Neg.output);
    });

    it('returns degrees for a matrix', async () => {
        const deg0 = {
            input: [
                [1, 0, 0],
                [1, 0, 0],
            ],
            output: '0deg',
        };
        const deg45 = {
            input: [
                [0.71, 0.71, -0.71],
                [0.71, 0, 0],
            ],
            output: '45deg',
        };
        const deg45Neg = {
            input: [
                [0.71, -0.71, 0.71],
                [0.71, 0, 0],
            ],
            output: '-45deg',
        };

        expect(getDegreesForMatrix(deg0.input)).toEqual(deg0.output);
        expect(getDegreesForMatrix(deg45.input)).toEqual(deg45.output);
        expect(getDegreesForMatrix(deg45Neg.input)).toEqual(deg45Neg.output);
    });
});
