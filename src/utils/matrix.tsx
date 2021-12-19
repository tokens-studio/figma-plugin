function convertToDegrees(matrix) {
  const values = [...matrix[0], ...matrix[1]];
  const a = values[0];
  const b = values[1];
  const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
  return angle < 0 ? angle + 360 : angle;
}

function getTx(deg) {
  if (deg >= 120) {
    if (deg >= 180) {
      return 1;
    }
    return 0.5;
  }
  return 0;
}

// Gets a Matrix for a degree value
// If you read this and know math (unlike me), PLEASE fix this D:
export function getMatrixForDegrees(deg) {
  const rad = parseFloat(deg) * (Math.PI / 180);

  const a = Math.round(Math.cos(rad) * 100) / 100;
  const b = Math.round(Math.sin(rad) * 100) / 100;
  const c = -Math.round(Math.sin(rad) * 100) / 100;
  const d = Math.round(Math.cos(rad) * 100) / 100;
  const tx = getTx(deg);
  const ty = deg >= 120 ? 1 : 0;

  return [
    [a, b, tx],
    [c, d, ty],
  ];
}

export function getDegreesForMatrix(matrix) {
  const degrees = convertToDegrees(matrix) || 0;
  return `${degrees}deg`;
}
