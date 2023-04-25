export default function removeEmptyValues(obj: Record<string, any>) {
  Object.entries(obj).forEach(([key, value]) => {
    if (value === '') {
      // If current property is an empty string, delete it
      delete obj[key];
    } else if (typeof value === 'object') {
      // If current property is an object, recursively call removeEmptyValues on it
      removeEmptyValues(value);
      // After removing empty strings from child objects, if child object is now empty, delete it as well
      if (Object.keys(value).length === 0) {
        delete obj[key];
      }
    }
  });
  return obj;
}
