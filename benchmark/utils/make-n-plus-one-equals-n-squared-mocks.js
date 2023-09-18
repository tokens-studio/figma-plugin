
const fs = require('fs');
const path = require('path');

const createDeepTokens = (depth) => {
    const obj = {
     "index_0": {"value": "10px", type: "dimension"}
    };

    for(n = 0; n <= depth; n++){
      obj[`index_${n+1}`] = {value: `{index_${n}} * {index_${n}}`, type: "dimension"}
    }

    return obj;
  };


const relativePath = './n-plus-one-equals-n-squared_n' + depth  + '.json';
const absolutePath = path.resolve(__dirname, relativePath);
const content =  JSON.stringify(createDeepTokens(25), null, 2);

fs.writeFileSync(absolutePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully.');
  }
});