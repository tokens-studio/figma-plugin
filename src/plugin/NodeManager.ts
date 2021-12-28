import hash from 'object-hash';
import split from 'just-split';
import compact from 'just-compact';
import { Properties } from '@/constants/Properties';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { NodeTokenRefValue } from '@/types/NodeTokenRefValue';
import { runOnNextFrame } from '@/utils/runOnNextFrame';
import { UpdateMode } from '@/types/state';
import { hasTokens } from '@/utils/hasTokens';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { MessageFromPluginTypes } from '@/types/messages';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { postToUI } from './notifiers';

type NodeManagerNode = {
  id: string;
  hash: string;
  tokens: NodeTokenRefMap;
};

const CHUNK_SIZE = 10;

export class NodeManager {
  private nodes: NodeManagerNode[];

  private updating: Promise<void> | null = null;

  constructor() {
    let defaultNodes: NodeManagerNode[] = [];
    const cache = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.nodemanagerCache);
    if (cache) {
      defaultNodes = JSON.parse(cache);
    }

    this.nodes = defaultNodes;
    console.log(`Cache size ${defaultNodes.length}`);
  }

  private normalizePluginTokenRef(map: NodeTokenRefMap) {
    const next = { ...map };
    // Pre-Version 53 had horizontalPadding and verticalPadding.
    if (next.horizontalPadding) {
      if (next.paddingLeft) next.paddingLeft = next.horizontalPadding;
      if (next.paddingRight) next.paddingRight = next.horizontalPadding;
    }
    if (next.verticalPadding) {
      if (next.paddingTop) next.paddingTop = next.verticalPadding;
      if (next.paddingBottom) next.paddingBottom = next.verticalPadding;
    }
    return next;
  }

  private async getNodePluginData(node: BaseNode) {
    let checksum = tokensSharedDataHandler.get(node, SharedPluginDataKeys.tokens.hash);
    const registeredEntry = this.nodes.find(({ id }) => node.id === id);

    if (registeredEntry && registeredEntry.hash === checksum) {
      return registeredEntry;
    }

    let tokens: NodeTokenRefMap | null = null;

    // @deprecated - moved to separated token values
    const deprecatedValuesProp = node.getPluginData('values');
    if (deprecatedValuesProp) {
      tokens = JSON.parse(deprecatedValuesProp) as NodeTokenRefMap;
      // migrate values to new format
      // there's no need to keep supporting deprecated data structures
      // this will take more time on startup but only once
      await Promise.all(
        Object.keys(tokens).map(async (property) => {
          tokensSharedDataHandler.set(node, property, tokens?.[property]);
        }),
      );
    }

    if (!tokens) {
      tokens = Object.fromEntries(
        compact(
          await Promise.all(
            Object.values(Properties).map(async (property) => {
              let fromShared = true;
              let value = tokensSharedDataHandler.get(node, property);

              if (!value) {
                value = node.getPluginData(property);
                fromShared = false;
              }

              if (value) {
                // migrate from private to shared data if the data is coming from private
                if (!fromShared) {
                  tokensSharedDataHandler.set(node, property, value);
                }

                return [property, JSON.parse(value)] as [Properties, NodeTokenRefValue];
              }

              return null;
            }),
          ),
        ),
      ) as NodeTokenRefMap;
    }

    checksum = hash(tokens);
    tokensSharedDataHandler.set(node, SharedPluginDataKeys.tokens.hash, checksum);

    return {
      id: node.id,
      hash: checksum,
      tokens: this.normalizePluginTokenRef(tokens),
    };
  }

  public async update(nodes: BaseNode[]) {
    postToUI({
      type: MessageFromPluginTypes.UPDATE_NODEMANAGER_CACHE_STATE,
      nodemanagerCacheState: {
        building: true,
        cachedCount: 0,
        totalCount: nodes.length,
      },
    });

    // wait for previous update
    if (this.updating) {
      await this.updating;
    }

    this.updating = (async () => {
      const allNodes = nodes;
      const nodeChunks = split(allNodes, CHUNK_SIZE);
      for (let chunkIndex = 0; chunkIndex < nodeChunks.length; chunkIndex += 1) {
        const chunk = nodeChunks[chunkIndex];
        await runOnNextFrame(async () => {
          await Promise.all(
            chunk.map(async (node) => {
              const data = await this.getNodePluginData(node);
              const indexOf = this.nodes.findIndex(({ id }) => id === node.id);
              if (indexOf > -1) {
                this.nodes[indexOf] = data;
              } else {
                this.nodes.push(data);
              }
            }),
          );

          tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.nodemanagerCache, JSON.stringify(this.nodes));
          postToUI({
            type: MessageFromPluginTypes.UPDATE_NODEMANAGER_CACHE_STATE,
            nodemanagerCacheState: {
              building: true,
              cachedCount: chunkIndex * CHUNK_SIZE,
              totalCount: nodes.length,
            },
          });
        });
      }
    })();
    await this.updating;

    postToUI({
      type: MessageFromPluginTypes.UPDATE_NODEMANAGER_CACHE_STATE,
      nodemanagerCacheState: {
        building: false,
        cachedCount: nodes.length,
        totalCount: nodes.length,
      },
    });
  }

  public async findNodesWithData(opts: {
    updateMode?: UpdateMode;
    nodes?: readonly BaseNode[];
  }) {
    // wait for previous update
    if (this.updating) {
      await this.updating;
    }

    const { updateMode, nodes } = opts;

    let relevantNodes: BaseNode[] = [];
    if (nodes) {
      relevantNodes = Array.from(nodes);
    } else if (updateMode === UpdateMode.PAGE) {
      relevantNodes = figma.currentPage.findAll();
    } else if (updateMode === UpdateMode.SELECTION) {
      relevantNodes = Array.from(figma.currentPage.selection);
    } else {
      relevantNodes = figma.root.findAll();
    }

    const unregisteredNodes = relevantNodes
      .filter((node) => !this.nodes.find((n) => n.id === node.id));
    await this.update(unregisteredNodes);

    const relevantNodeIds = relevantNodes.map((node) => node.id);
    return this.nodes.filter((node) => relevantNodeIds.includes(node.id) && hasTokens(node.tokens));
  }

  public async updateNode(node: BaseNode, tokensOrCallback: NodeTokenRefMap | ((tokens: NodeTokenRefMap) => NodeTokenRefMap)) {
    let registeredIndex = this.nodes.findIndex((entry) => entry.id === node.id);
    if (registeredIndex === -1) {
      await this.update([node]);
      registeredIndex = this.nodes.findIndex((entry) => entry.id === node.id);
    }

    if (registeredIndex > -1) {
      const tokens = typeof tokensOrCallback === 'function'
        ? tokensOrCallback({ ...this.nodes[registeredIndex].tokens })
        : tokensOrCallback;

      this.nodes[registeredIndex].tokens = tokens;
      tokensSharedDataHandler.set(node, SharedPluginDataKeys.tokens.hash, hash(tokens));
    }
  }
}

export const defaultNodeManager = new NodeManager();
