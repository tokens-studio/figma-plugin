export const createDeepTokens = (depth: number) => {
    const obj: any = {
      "referenced": {}
    };
   
    obj.referenced = { value: `{${new Array(depth).fill('nest', 0, depth).join('.')}}`, type: 'other' };
   
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