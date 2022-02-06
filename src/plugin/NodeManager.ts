import hash from 'object-hash';
import compact from 'just-compact';
import debounce from 'just-debounce-it';
import { EventEmitter } from 'eventemitter3';
import { Properties } from '@/constants/Properties';
import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { NodeTokenRefValue } from '@/types/NodeTokenRefValue';
import { UpdateMode } from '@/types/state';
import { hasTokens } from '@/utils/hasTokens';
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

type NodemanagerCacheNode = {
  hash: string;
  tokens: NodeTokenRefMap;
  createdAt: number
};

export type NodeManagerNode = {
  id: string;
  node: BaseNode
  hash: string;
  tokens: NodeTokenRefMap;
};

export class NodeManager {
  private emitter = new EventEmitter();

  private persistentNodesCache = new Map<string, NodemanagerCacheNode>();

  private nodes = new Map<string, NodeManagerNode>();

  private updating: Promise<void> | null = null;

  constructor() {
    if (typeof figma.root !== 'undefined') {
      const cacheJson = tokensSharedDataHandler.get(figma.root, SharedPluginDataKeys.tokens.persistentNodesCache);
      console.log('CAcheJSON', cacheJson);
      if (cacheJson) {
        const parsedCache = JSON.parse(cacheJson) as [string, NodemanagerCacheNode][];
        this.persistentNodesCache = new Map(parsedCache);
      }

      this.emitter.on('cache-update', debounce(() => {
        const entries = Array.from(this.persistentNodesCache.entries());
        tokensSharedDataHandler.set(figma.root, SharedPluginDataKeys.tokens.persistentNodesCache, JSON.stringify(entries));
      }, 500));
    }
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
    console.log('getting plugin data', node);
    const checksum = tokensSharedDataHandler.get(node, SharedPluginDataKeys.tokens.hash);
    console.log('checksum', checksum);

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
    const version = parseIntOrDefault(tokensSharedDataHandler.get(node, SharedPluginDataKeys.tokens.version), 0);
    const migrationFlags = {
      v72: version && version >= currentPluginVersion,
    };
    let tokens: NodeTokenRefMap | null = null;

    // only perform this action if the node has not been migrated yet
    if (!migrationFlags.v72) {
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
        node.setPluginData('values', '');
      }
    }

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
      const deprecatedAvailableKeys = (!migrationFlags.v72 ? node.getPluginDataKeys() : []).filter((key) => (
        !excludedKeys.includes(key)
      ));

      tokens = Object.fromEntries(
        compact(
          await Promise.all([
            ...deprecatedAvailableKeys.map((property) => {
              const value = node.getPluginData(property);
              if (value) {
                // migrate from private to shared data if the data is coming from private
                node.setPluginData(property, '');
                tokensSharedDataHandler.set(node, property, value);
                try {
                  // make sure we catch JSON parse errors in case invalid property keys are set and found
                  return [property, JSON.parse(value)] as [Properties, NodeTokenRefValue];
                } catch (err) {
                  console.warn(err);
                }
              }
              return null;
            }),
            ...availableSharedKeys.map((property) => {
              const value = tokensSharedDataHandler.get(node, property);
              if (value) {
                try {
                  // make sure we catch JSON parse errors in case invalid property keys are set and found
                  return [property, JSON.parse(value)] as [Properties, NodeTokenRefValue];
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
      hash: hash(tokens),
      tokens: this.normalizePluginTokenRef(tokens),
    };
    console.log('Before got tokens', entry);

    if (Object.keys(entry.tokens).length) {
      console.log('Got tokens', entry.tokens);
      if (entry.hash !== checksum) {
        console.log('Is not checksum, setting');
        tokensSharedDataHandler.set(node, SharedPluginDataKeys.tokens.hash, checksum);
      }
      if (version !== currentPluginVersion) {
        console.log('Is not current plugin version, setting');
        tokensSharedDataHandler.set(node, SharedPluginDataKeys.tokens.version, String(currentPluginVersion));
      }

      this.persistentNodesCache.set(entry.id, {
        hash: entry.hash,
        tokens: entry.tokens,
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

    console.log('Updating cache...', nodes);

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

          console.log('before getting data', node.id);

          await this.getNodePluginData(node);

          console.log('after getting data', node.id);
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
      console.log('Update mode is page');

      relevantNodes = findAll([figma.currentPage], false);
    } else if (updateMode === UpdateMode.SELECTION) {
      console.log('Update mode is select');

      relevantNodes = findAll(figma.currentPage.selection, true);
    } else {
      console.log('Update mode is all');

      relevantNodes = findAll([figma.root], false);
    }
    const unregisteredNodes = relevantNodes
      .filter((node) => !this.nodes.has(node.id));
    await this.update(unregisteredNodes);

    const relevantNodeIds = relevantNodes.map((node) => node.id);
    const resultingNodes = compact(relevantNodeIds.map((nodeId) => {
      const cache = this.nodes.get(nodeId);
      if (cache && hasTokens(cache.tokens)) {
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
        entry.tokens = tokens;
        entry.hash = checksum;
        tokensSharedDataHandler.set(node, SharedPluginDataKeys.tokens.hash, hash(tokens));
      }
    }
  }
}

export const defaultNodeManager = new NodeManager();
