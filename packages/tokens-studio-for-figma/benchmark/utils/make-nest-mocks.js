
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

const depths = [2,10,100]


depths.forEach(depth => {
const relativePath = './nest_' + depth + '.json';y
const absolutePath = path.resolve(__dirname, relativePath);
const content =  JSON.stringify(createDeepTokens(depth), null, 2);
fs.writeFileSync(absolutePath, content, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('File written successfully.');
  }
});

});