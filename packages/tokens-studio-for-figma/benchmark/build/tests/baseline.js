/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!*************************************!*\
  !*** ./benchmark/tests/baseline.ts ***!
  \*************************************/
/* eslint-disable no-plusplus */ function bubbleSort(array) {
    for(var i = 0; i < array.length; i++){
        for(var j = 0; j < array.length - i - 1; j++){
            if (array[j] > array[j + 1]) {
                var temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
            }
        }
    }
}
bubbleSort([
    5,
    4,
    3,
    2,
    1
]);
bubbleSort(Array.from(50, function(v, k) {
    return k;
}));

/******/ })()
;
//# sourceMappingURL=baseline.js.map