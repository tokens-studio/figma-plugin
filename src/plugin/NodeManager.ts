import hash from 'object-hash';
import compact from 'just-compact';
import debounce from 'just-debounce-it';
import { EventEmitter } from 'eventemitter3';
import { Properties } from '@/constants/Properties';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { NodeTokenRefValue } from '@/types/NodeTokenRefValue';
import { SharedPluginDataKeys } from '@/constants/SharedPluginDataKeys';
import { MessageFromPluginTypes } from '@/types/messages';
import { parseIntOrDefault } from '@/utils/parseIntOrDefault';
import { findAll } from '@/utils/findAll';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { postToUI } from './notifiers';
import { defaultWorker } from './Worker';
import pkg from '../../package.json';
import { ProgressTracker } from './ProgressTracker';
import { UpdateMode } from '@/constants/UpdateMode';
import { HashProperty, PersistentNodesCacheProperty, VersionProperty } from '@/figmaStorage';

export type NodemanagerCacheNode = {
  hash: string;
  mainKey?: string;
  tokens: NodeTokenRefMap;
  createdAt: number
};

export type NodeManagerNode = {
  id: string;
  node: BaseNode
  hash: string;
  mainKey?: string;
  tokens: NodeTokenRefMap;
};

function getMainKey(node: BaseNode): string | undefined {
  return node.type === 'INSTANCE' ? node.mainComponent?.key : undefined;
}

export class NodeManager {
  private emitter = new EventEmitter();

  private persistentNodesCache = new Map<string, NodemanagerCacheNode>();

  private nodes = new Map<string, NodeManagerNode>();

  private updating: Promise<void> | null = null;

  constructor() {
    this.updating = new Promise(async (resolve) => {
      if (typeof figma.root !== 'undefined') {
        const parsedCache = await PersistentNodesCacheProperty.read(figma.root);
        if (parsedCache) {
          this.persistentNodesCache = new Map(parsedCache);
        }

        // Compare nodes in the document to what we have in the cache
        const allNodes = figma.root.findAll();
        if (allNodes.length > 0) {
          const nodeIds = new Set(allNodes.map((node) => node.id));
          let hasDeletedNodes = false;

          // Remove any nodes from the cache that no longer exist
          for (const [id] of this.persistentNodesCache) {
            if (!nodeIds.has(id)) {
              this.persistentNodesCache.delete(id);
              hasDeletedNodes = true;
            }
          }

          // Cache update if we removed any nodes
          if (hasDeletedNodes) {
            const remainingEntries = Array.from(this.persistentNodesCache.entries());
            await PersistentNodesCacheProperty.write(remainingEntries);
          }
        }

        this.emitter.on('cache-update', debounce(async () => {
          const entries = Array.from(this.persistentNodesCache.entries());
          await PersistentNodesCacheProperty.write(entries);
        }, 500));
      }
      resolve();
    });
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
    const checksum = await HashProperty.read(node);
    const registeredPersistentEntry = this.persistentNodesCache.get(node.id);
    if (
      registeredPersistentEntry
      && registeredPersistentEntry.hash === checksum
      && !this.nodes.has(node.id)
    ) {
      this.nodes.set(node.id, {
        ...registeredPersistentEntry,
        id: node.id,
        node,
      });
    }

    const registeredEntry = this.nodes.get(node.id);
    if (registeredEntry && registeredEntry.hash === checksum) {
      return registeredEntry;
    }

    const currentPluginVersion = parseInt(pkg.plugin_version, 10);
    const version = parseIntOrDefault(await VersionProperty.read(node), 0);
    let tokens: NodeTokenRefMap | null = null;

    if (!tokens) {
      // also consider the non-shared keys if the v72 migration has not been executed
      const excludedKeys = [
        SharedPluginDataKeys.tokens.version,
        SharedPluginDataKeys.tokens.updatedAt,
        SharedPluginDataKeys.tokens.values,
        SharedPluginDataKeys.tokens.hash,
        SharedPluginDataKeys.tokens.storageType,
        SharedPluginDataKeys.tokens.persistentNodesCache,
      ];

      const availableSharedKeys = tokensSharedDataHandler.keys(node).filter((key) => (
        !excludedKeys.includes(key)
      ));

      tokens = Object.fromEntries(
        compact(
          await Promise.all([
            ...availableSharedKeys.map((property) => {
              const value = tokensSharedDataHandler.get(node, property);
              if (value) {
                try {
                  // make sure we catch JSON parse errors in case invalid property keys are set and found
                  // we're storing `none` as a string without quotes
                  const parsedValue = value === 'none' ? 'none' : JSON.parse(value);
                  return [property, parsedValue] as [Properties, NodeTokenRefValue];
                } catch (err) {
                  console.warn(err);
                }
              }
              return null;
            }),
          ]),
        ),
      ) as NodeTokenRefMap;
    }

    const entry = {
      node,
      id: node.id,
      mainKey: getMainKey(node),
      hash: hash(tokens),
      tokens: this.normalizePluginTokenRef(tokens),
    };

    if (Object.keys(entry.tokens).length) {
      if (entry.hash !== checksum) {
        await HashProperty.write(checksum, node);
      }
      if (version !== currentPluginVersion) {
        await VersionProperty.write(String(currentPluginVersion), node);
      }

      this.persistentNodesCache.set(entry.id, {
        hash: entry.hash,
        tokens: entry.tokens,
        mainKey: entry.mainKey,
        createdAt: Date.now(),
      });
      this.emitter.emit('cache-update');
    }

    this.nodes.set(entry.id, entry);

    return entry;
  }

  private async waitForUpdating() {
    return new Promise<void>((res) => {
      if (this.updating) {
        this.updating
          .then(() => res())
          .catch(() => res());
      } else {
        res();
      }
    });
  }

  public async update(nodes: readonly BaseNode[]) {
    // wait for previous update
    await this.waitForUpdating();

    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.NODEMANAGER_UPDATE,
        timePerTask: 20,
        completedTasks: 0,
        totalTasks: nodes.length,
      },
    });

    this.updating = (async () => {
      const tracker = new ProgressTracker(BackgroundJobs.NODEMANAGER_UPDATE);

      const promises: Set<Promise<void>> = new Set();
      for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex += 1) {
        // eslint-disable-next-line
        promises.add(defaultWorker.schedule(async () => {
          const node = nodes[nodeIndex];

          try {
            await this.getNodePluginData(node);
          } catch (error) {
            console.warn(`Node ${node.id} no longer exists`);
          }
          tracker.next();
          tracker.reportIfNecessary();
        }));
      }
      await Promise.all(promises);
    })();
    await this.waitForUpdating();

    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.NODEMANAGER_UPDATE,
    });

    return compact(nodes.map((node) => this.nodes.get(node.id)));
  }

  public async getNode(id: string) {
    await this.waitForUpdating();
    return this.nodes.get(id);
  }

  public async findNodesWithData(opts: {
    updateMode?: UpdateMode;
    nodes?: readonly BaseNode[];
  }) {
    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA,
      },
    });

    // wait for previous update
    await this.waitForUpdating();

    const { updateMode, nodes } = opts;
    let relevantNodes: BaseNode[] = [];
    if (nodes) {
      relevantNodes = Array.from(nodes);
    } else if (updateMode === UpdateMode.PAGE) {
      relevantNodes = findAll([figma.currentPage], false);
    } else if (updateMode === UpdateMode.SELECTION) {
      relevantNodes = findAll(figma.currentPage.selection, true);
    } else {
      relevantNodes = findAll([figma.root], false);
    }

    const unregisteredNodes = relevantNodes
      .filter((node) => {
        const mainKey = getMainKey(node);
        return !this.nodes.has(node.id) || (node.type === 'INSTANCE' && mainKey !== this.nodes.get(node.id)?.mainKey);
      });

    await this.update(unregisteredNodes);

    const relevantNodeIds = relevantNodes.map((node) => node.id);
    const resultingNodes = compact(relevantNodeIds.map((nodeId) => {
      const cache = this.nodes.get(nodeId);
      if (cache) {
        return cache;
      }
      return null;
    }));

    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA,
    });

    return resultingNodes;
  }

  public async updateNode(node: BaseNode, tokensOrCallback: NodeTokenRefMap | ((tokens: NodeTokenRefMap) => NodeTokenRefMap)) {
    if (!this.nodes.has(node.id)) {
      await this.update([node]);
    }

    const entry = this.nodes.get(node.id);
    if (entry) {
      const tokens = typeof tokensOrCallback === 'function'
        ? tokensOrCallback({ ...entry.tokens })
        : tokensOrCallback;

      const checksum = hash(tokens);
      if (checksum !== entry.hash) {
        // If another node uses this node (e.g. component instances) we need to invalidate their cache by either looking at naming or main key
        const hasSameMainKey = (n: typeof entry) => (node.type === 'COMPONENT' ? n.mainKey === node.key : false);
        const nodesRequiringInvalidation = [...this.nodes.values()].filter((n) => (n.id.includes(`;${node.id}`) || hasSameMainKey(n)));

        nodesRequiringInvalidation.forEach((n) => {
          this.nodes.delete(n.id);
        });
        entry.tokens = tokens;
        entry.hash = checksum;
        await HashProperty.write(hash(tokens), node);
      }
    }
  }
}

export const defaultNodeManager = new NodeManager();
