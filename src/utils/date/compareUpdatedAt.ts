export async function compareUpdatedAt(oldUpdatedAt: string | number | Date, newUpdatedAt: string | number | Date) {
  const newDate = new Date(newUpdatedAt).getTime();
  const oldDate = new Date(oldUpdatedAt).getTime();
  if (newDate > oldDate) {
    return 'remote_newer';
  }
  if (newDate === oldDate) {
    return 'same';
  }
  return 'remote_older';
}
