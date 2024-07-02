const mock = require('../mocks/swapThemeMock.json')
const figmaApi = require("figma-api-stub")

const fs = require('fs');
const path = require('path');


//@ts-ignore
global.figma = figmaApi.createFigma({
  simulateErrors: true
});

mock.tokenValues.Light.forEach(token => {
   const rect =  global.figma.createRectangle()
   rect.setSharedPluginData('tokens', 'fill', token.name)
   rect.name = token.name
   rect.parent = 'undefined'
})



function writeChildren(){
const relativePath = '../mocks/flat-file_children'  + '.json';
const absolutePath = path.resolve(__dirname, relativePath);
const content =  JSON.stringify(global.figma._currentPage.children, 'null', 2)
fs.writeFileSync(absolutePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully.');
  }
});
}
function writePage(){
const relativePath = '../mocks/flat-file_currentpage'  + '.json';
const absolutePath = path.resolve(__dirname, relativePath);
global.figma._currentPage.children = []
global.figma._currentPage.parent.children = []
console.log(global.figma._currentPage)

const content =  JSON.stringify(global.figma._currentPage, null, 2 )
fs.writeFileSync(absolutePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully.');
  }
});
}


writeChildren()
writePage()
