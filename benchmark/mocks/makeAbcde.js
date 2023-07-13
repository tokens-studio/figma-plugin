
const fs = require('fs');
const path = require('path');



const createDeepTokens = (depth) => {
    const obj = {
     "index_0": {"value": "10px", type: "dimension"}
    };

    for(n = 0; n <= depth; n++){
      obj[`index_${n+1}`] = {value: `{index_${n}} * {index_${n}}`, type: "dimension"}
    }

    // let currentObject = obj;
    // for (let i = 1; i <= depth; i++) {
    //   const key = 'nest';
    //   currentObject[key] = {};
    //   currentObject = currentObject[key];
    //   if (i === depth) {
    //     currentObject[key] = { value: '10px', type: 'dimension' };
    //   }
    //}
  
    return obj;
  };





// Define the relative path and file name
const relativePath = './abcdefmock'  + '.json';

// Construct the absolute path based on the current directory
const absolutePath = path.resolve(__dirname, relativePath);

// Content to be written to the file
const content =  JSON.stringify(createDeepTokens(25), null, 2);

// Write the file
fs.writeFileSync(absolutePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully.');
  }
});