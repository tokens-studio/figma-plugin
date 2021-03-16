function Matrix() {
    this.a = 1;
    this.b = 0;
    this.c = 0;
    this.d = 1;
    this.e = 0;
    this.f = 0;
}

Matrix.prototype = {
    /**
     * Multiplies current matrix with new matrix values.
     * @param {number} a2 - scale x
     * @param {number} b2 - skew y
     * @param {number} c2 - skew x
     * @param {number} d2 - scale y
     * @param {number} e2 - translate x
     * @param {number} f2 - translate y
     */
    transform(a2, b2, c2, d2, e2, f2) {
        const a1 = this.a;
        const b1 = this.b;
        const c1 = this.c;
        const d1 = this.d;
        const e1 = this.e;
        const f1 = this.f;

        /* matrix order:
         * ace
         * bdf
         * 001
         */
        this.a = Math.round((a1 * a2 + c1 * b2) * 100) / 100;
        this.b = Math.round((b1 * a2 + d1 * b2) * 100) / 100;
        this.c = Math.round((a1 * c2 + c1 * d2) * 100) / 100;
        this.d = Math.round((b1 * c2 + d1 * d2) * 100) / 100;
        this.e = Math.round((a1 * e2 + c1 * f2 + e1) * 100) / 100;
        this.f = Math.round((b1 * e2 + d1 * f2 + f1) * 100) / 100;

        return this;
    },

    /**
     * Rotates current matrix accumulative by angle.
     * @param {number} angle - angle in radians
     */
    rotate(angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        this.transform(cos, sin, -sin, cos, 0, 0);
        return this;
    },

    /**
     * Helper method to make a rotation based on an angle in degrees.
     * @param {number} angle - angle in degrees
     */
    rotateDeg(angle) {
        this.rotate(angle * 0.017453292519943295);
        return this;
    },
    getMatrixForDegrees(degrees) {
        this.rotateDeg(degrees);
        return this;
    },
};

function convertToDegrees(matrix) {
    const sin = matrix[0][1]; // 0.5

    return Math.round(Math.asin(sin) * (180 / Math.PI));
}

export function getMatrixForDegrees(degrees) {
    const matrix = new Matrix();
    const {a, b, c, d, e, f} = matrix.rotateDeg(degrees);
    return [
        [a, b, c],
        [d, e, f],
    ];
}

export function getDegreesForMatrix(matrix) {
    const degrees = convertToDegrees(matrix) || 0;
    return `${degrees}deg`;
}
