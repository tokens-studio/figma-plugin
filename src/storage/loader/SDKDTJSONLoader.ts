//
//  SDKDTJSONLoader.ts
//  Supernova SDK
//
//  Created by Jiri Trecak.
//  Copyright © 2021 Supernova. All rights reserved.
//

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Imports

// import fs from "fs"

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Types

export type DTParsedNode = {
  rootKey: string;
  name: string;
  path: Array<string>;
  type: string;
  value: any;
  description: string | null;
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// MARK: - Tool implementation

/** Design Tokens Plugin Manipulation Tool */
export class NodeLoader {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Properties

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Constructor

  constructor() {}

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Loader

  /** Load token definitions from string */
  loadDSObjectsFromDefinition(definition: string): Array<DTParsedNode> {
    let data = this.parseDefinition(definition);
    return this.processDefinitionTree(data);
  }

  /** Load token definitions from object */
  loadDSObjectsFromObject(object: object): Array<DTParsedNode> {
    return this.processDefinitionTree(object);
  }

  /** Load token definitions from path */
  /*
  async loadDSObjectsFromPath(path: string): Promise<Array<DTParsedNode>> {

    try {
      let definition = fs.readFileSync(path, "utf8") 
      return this.loadDSObjectsFromDefinition(definition)
    } catch (error) {
      throw SupernovaError.fromProcessingError(
        'Unable to load JSON definition file: ' + error
      )
    }
  }*/

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - File Parser

  private parseDefinition(definition: string): object {
    try {
      let object = JSON.parse(definition);
      if (typeof object !== 'object') {
        throw new Error('Invalid token definition JSON file - root level entity must be object');
      }
      return object;
    } catch (error) {
      throw new Error('Invalid token definition JSON file - file structure invalid');
    }
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // MARK: - Node Parser

  private processDefinitionTree(definition: object): Array<DTParsedNode> {
    let nodes = this.parseNode([], definition);
    return nodes;
  }

  private parseNode(path: Array<string>, objects: object): Array<DTParsedNode> {
    let result: Array<DTParsedNode> = [];
    for (let [name, value] of Object.entries(objects)) {
      if (typeof value === 'object') {
        if (name.startsWith('$')) {
          // Skipping keys internal to desing token plugin for now
        } else if (value.hasOwnProperty('value') && value.hasOwnProperty('type')) {
          // Treat as value
          let entity = {
            rootKey: path[0],
            name: name,
            path: path,
            type: value['type'],
            value: value['value'],
            description: value['description'] ?? null,
          };
          result.push(entity);
        } else {
          // Treat as leaf
          result = result.concat(this.parseNode(path.concat(name), value));
        }
      } else {
        throw new Error('Unable to parse, unsupported structure in color node leaf');
      }
    }

    return result;
  }
}
