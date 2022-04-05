// @TODO typing!
export function expand(token) {
  return Object.entries(token).reduce((acc, [key, val]) => {
    if (typeof val === 'string' || typeof val === 'number') {
      acc[key] = {
        value: val,
        type: key,
      };
    } else {
      acc[key] = expand(val);
    }

    return acc;
  }, {});
}
