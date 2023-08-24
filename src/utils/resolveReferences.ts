interface Node {
  name: string;
  value: string;
  resolvedValue?: number;
  children: Node[];
}

function createNode(name: string, value: string): Node {
  return {
    name,
    value,
    children: [],
  };
}

export function buildTree(array: { name: string; value: string }[]): Node {
  const nodes: { [name: string]: Node } = {};

  // Create nodes for each reference
  for (const item of array) {
    const { name, value } = item;
    nodes[name] = createNode(name, value);
    console.log(`Created node ${name} with value ${value}`);
  }

  // Set parent-child relationships
  for (const item of array) {
    const { name, value } = item;
    const node = nodes[name];

    // Find references in value property
    const references = value.match(/{([^}]+)}/g) || [];

    // Set parent-child relationships
    for (const reference of references) {
      const childName = reference.slice(1, -1);
      const childNode = nodes[childName];
      if (childNode) {
        node.children.push(childNode);
        console.log(`Added child ${childName} to node ${name}`);
      }
    }
  }

  console.log(nodes);

  // Find root node
  let rootNode;
  const nodeKeys = Object.keys(nodes);
  for (let i = 0; i < nodeKeys.length; i += 1) {
    const name = nodeKeys[i];
    if (nodes.hasOwnProperty(name)) {
      const node = nodes[name];
      if (node.children.length === 0) {
        rootNode = node;
        break;
      }
    }
  }
  for (let i = 0; i < nodeKeys.length; i += 1) {
    const key = nodeKeys[i];
    if (nodes.hasOwnProperty(key)) {
      const node = nodes[key];
      if (node.children.length === 0) {
        rootNode = node;
        break;
      }
    }
    const node = nodes[key];
    if (node.children.length === 0) {
      rootNode = node;
      break;
    }
  }

  return rootNode;
}

export function resolveReferences(node: Node, memo = new Map()): number {
  if (memo.has(node)) {
    return memo.get(node);
  }

  const { value, children } = node;
  const resolvedValue = value.replace(/{([^}]+)}/g, (match, name) => {
    const childNode = children.find((child) => child.name === name);
    if (childNode) {
      return resolveReferences(childNode, memo);
    }
    return match;
  });

  const result = Number(resolvedValue);
  node.resolvedValue = result;
  memo.set(node, result);
  return result;
}
