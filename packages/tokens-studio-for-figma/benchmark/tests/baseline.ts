/* eslint-disable no-plusplus */
function bubbleSort(array: number[]) {
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        const temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
      }
    }
  }
}

bubbleSort([5, 4, 3, 2, 1]);
bubbleSort(Array.from(50, (v, k) => k));
