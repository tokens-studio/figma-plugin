export default function getFigmaDashPattern(borderWidth: number) {
  switch (borderWidth) {
    case 1:
      return [3, 2];
    case 2:
      return [6, 3];
    case 3:
      return [6, 3];
    case 4:
      return [8, 4];
    case 5:
      return [10, 5];
    default:
      return [10, 10];
  }
}
