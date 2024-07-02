import { NodeTokenRefMap } from '@/types/NodeTokenRefMap';
import { MessageFromPluginTypes } from '@/types/messages';
import { findAll } from '@/utils/findAll';
import { BackgroundJobs } from '@/constants/BackgroundJobs';
import { tokensSharedDataHandler } from './SharedDataHandler';
import { postToUI } from './notifiers';
import { defaultWorker } from './Worker';
import { ProgressTracker } from './ProgressTracker';
import { UpdateMode } from '@/constants/UpdateMode';

export type NodeManagerNode = {
  id: string;
  node: BaseNode
  tokens: NodeTokenRefMap;
};

export class NodeManager {
  private updating: Promise<void> | null = null;

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

  public async getNode(id: string): Promise<NodeManagerNode | null> {
    await this.waitForUpdating();
    const node = figma.getNodeById(id);
    if (!node) return null;
    return {
      node,
      tokens: await tokensSharedDataHandler.getAll(node),
      id: node.id,
    };
  }

  public async findBaseNodesWithData(opts: {
    updateMode?: UpdateMode;
    nodes?: readonly BaseNode[];
    nodesWithoutPluginData?: boolean;
  }) {
    const tracker = new ProgressTracker(BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA);
    const promises: Set<Promise<void>> = new Set();
    const returnedNodes: NodeManagerNode[] = [];

    // wait for previous update
    await this.waitForUpdating();

    const { updateMode, nodes } = opts;
    let relevantNodes: BaseNode[] = [];
    if (nodes) {
      relevantNodes = Array.from(nodes);
    } else if (updateMode === UpdateMode.PAGE) {
      relevantNodes = findAll([figma.currentPage], false, opts.nodesWithoutPluginData);
    } else if (updateMode === UpdateMode.SELECTION) {
      relevantNodes = findAll(figma.currentPage.selection, true, opts.nodesWithoutPluginData);
    } else {
      relevantNodes = findAll([figma.root], false, opts.nodesWithoutPluginData);
    }

    postToUI({
      type: MessageFromPluginTypes.START_JOB,
      job: {
        name: BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA,
        timePerTask: 0.5,
        completedTasks: 0,
        totalTasks: relevantNodes.length,
      },
    });

    this.updating = (async () => {
      for (let nodeIndex = 0; nodeIndex < relevantNodes.length; nodeIndex += 1) {
        promises.add(defaultWorker.schedule(async () => {
          const node = relevantNodes[nodeIndex];

          returnedNodes.push({
            node: relevantNodes[nodeIndex],
            tokens: await tokensSharedDataHandler.getAll(node),
            id: node.id,
          });
          tracker.next();
          tracker.reportIfNecessary();
        }));
      }
      await Promise.all(promises);
    })();
    await this.waitForUpdating();

    postToUI({
      type: MessageFromPluginTypes.COMPLETE_JOB,
      name: BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA,
    });

    return returnedNodes;
  }
}

export const defaultNodeManager = new NodeManager();
