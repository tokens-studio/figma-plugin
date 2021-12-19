import split from 'just-split';
import compact from 'just-compact';
import {Properties} from '@/constants/Properties';
import {SharedPluginDataNamespaces} from '@/constants/SharedPluginDataNamespaces';
import {NodeTokenRefMap} from '@/types/NodeTokenRefMap';
import {NodeTokenRefValue} from '@/types/NodeTokenRefValue';
import {runOnNextFrame} from '@/utils/runOnNextFrame';
import {UpdateMode} from '@/types/state';
import {hasTokens} from '@/utils/hasTokens';

type NodeManageNode = {
    id: string;
    node: BaseNode;
    tokens: NodeTokenRefMap;
};

export class NodeManager {
    private nodes: NodeManageNode[] = [];

    private updating: Promise<void> | null = null;

    private updateInterval: ReturnType<typeof setInterval> | null = null;

    private normalizePluginTokenRef(map: NodeTokenRefMap) {
        const next = {...map};
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

    private async getNodePluginData(node: PageNode | SceneNode) {
        // @deprecated - moved to separated token values
        const deprecatedValuesProp = node.getPluginData('values');
        if (deprecatedValuesProp) {
            const tokens = JSON.parse(deprecatedValuesProp) as NodeTokenRefMap;
            // migrate values to new format
            // there's no need to keep supporting deprecated data structures
            // this will take more time on startup but only once
            await Promise.all(
                Object.keys(tokens).map(async (property) => {
                    node.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, property, tokens[property]);
                })
            );

            return {
                node,
                id: node.id,
                tokens: this.normalizePluginTokenRef(tokens),
            };
        }

        const tokens = Object.fromEntries(
            compact(
                await Promise.all(
                    Object.values(Properties).map(async (property) => {
                        let fromShared = true;
                        let value = node.getSharedPluginData(SharedPluginDataNamespaces.TOKENS, property);

                        if (!value) {
                            value = node.getPluginData(property);
                            fromShared = false;
                        }

                        if (value) {
                            // migrate from private to shared data if the data is coming from private
                            if (!fromShared) {
                                node.setSharedPluginData(SharedPluginDataNamespaces.TOKENS, property, value);
                            }

                            return [property, JSON.parse(value)] as [Properties, NodeTokenRefValue];
                        }

                        return null;
                    })
                )
            )
        ) as NodeTokenRefMap;

        return {
            node,
            id: node.id,
            tokens: this.normalizePluginTokenRef(tokens),
        };
    }

    public async update(nodeCallback?: (node: PageNode | SceneNode) => boolean) {
        this.updating = (async () => {
            const allNodes = split(figma.root.findAll(nodeCallback), 5);
            for (let chunkIndex = 0; chunkIndex < allNodes.length; chunkIndex += 1) {
                const chunk = allNodes[chunkIndex];
                await runOnNextFrame(async () => {
                    await Promise.all(
                        chunk.map(async (node) => {
                            const data = await this.getNodePluginData(node);
                            const indexOf = this.nodes.findIndex(({id}) => id === node.id);
                            if (indexOf > -1) {
                                this.nodes[indexOf] = data;
                            } else {
                                this.nodes.push(data);
                            }
                        })
                    );
                });
            }
        })();
        await this.updating;
    }

    public async findNodesWithData(opts: {updateMode?: UpdateMode; nodes?: readonly BaseNode[]; nodeIds?: string[]}) {
        // wait for previous update function
        await this.updating;

        const {updateMode, nodes, nodeIds} = opts;

        let relevantNodes: BaseNode[] = [];
        if (nodes) {
            relevantNodes = Array.from(nodes);
        } else if (nodeIds) {
            relevantNodes = figma.root.findAll((node) => nodeIds.includes(node.id));
        } else if (updateMode === UpdateMode.PAGE) {
            relevantNodes = figma.currentPage.findAll();
        } else if (updateMode === UpdateMode.SELECTION) {
            relevantNodes = Array.from(figma.currentPage.selection);
        } else {
            relevantNodes = figma.root.findAll();
        }

        const unrgisteredNodeIds = relevantNodes
            .filter((node) => !this.nodes.find((n) => n.id === node.id))
            .map((node) => node.id);
        await this.update((node) => unrgisteredNodeIds.includes(node.id));

        const relevantNodeIds = relevantNodes.map((node) => node.id);
        return this.nodes.filter((node) => relevantNodeIds.includes(node.id) && hasTokens(node.tokens));
    }

    public async updateNode(node: BaseNode, tokens: NodeTokenRefMap) {
        let registeredIndex = this.nodes.findIndex((entry) => entry.id === node.id);
        if (registeredIndex === -1) {
            await this.update((n) => n.id === node.id);
            registeredIndex = this.nodes.findIndex((entry) => entry.id === node.id);
        }

        if (registeredIndex > -1) {
            this.nodes[registeredIndex].tokens = tokens;
        }
    }

    public startUpdateInterval() {
        this.updateInterval = setInterval(() => {
            this.update((node) => !this.nodes.find((existingNode) => existingNode.id === node.id));
        }, 5000);
    }

    public stopUpdateInterval() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

export const defaultNodeManager = new NodeManager();
