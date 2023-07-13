
const fs = require('fs');
const path = require('path');

const createDeepTokens = (depth) => {
    const obj = {
      "referenced": {}
    };
   
    obj.referenced = { value: `{${new Array(depth).fill('nest', 0, depth).join('.')}}`, type: 'd' };
   
    let currentObject = obj;
    for (let i = 1; i <= depth; i++) {
      const key = 'nest';
      currentObject[key] = {};
      currentObject = currentObject[key];
      if (i === depth) {
        currentObject[key] = { value: '10px', type: 'dimension' };
      }
    }
  
    return obj;
  };

const depths = [2,5,10,20,50,100,500]


depths.forEach(depth => {
// Define the relative path and file name
const relativePath = './nest_' + depth + '.json';

// Construct the absolute path based on the current directory
const absolutePath = path.resolve(__dirname, relativePath);

// Content to be written to the file
const content =  JSON.stringify(createDeepTokens(depth), null, 2);

// Write the file
fs.writeFileSync(absolutePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully.');
  }
});

});