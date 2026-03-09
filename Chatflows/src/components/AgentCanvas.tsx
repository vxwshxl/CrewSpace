'use client';

import React, { useCallback, useRef } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    type Node,
    type Edge,
    type OnConnect,
    type OnNodesChange,
    type OnEdgesChange,
    addEdge,
    MarkerType,
    BackgroundVariant,
    type Connection,
    Panel,
} from '@xyflow/react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@xyflow/react/dist/style.css';

import StartNode from './nodes/StartNode';
import AgentNode from './nodes/AgentNode';
import ConditionNode from './nodes/ConditionNode';
import StickyNode from './nodes/StickyNode';

const nodeTypes = {
    start: StartNode,
    agent: AgentNode,
    condition: ConditionNode,
    sticky: StickyNode,
};

interface AgentCanvasProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    onNodeClick: (event: React.MouseEvent, node: Node) => void;
    onPaneClick?: (event: React.MouseEvent) => void;
    onNodeDelete?: (nodeId: string) => void;
    onNodeDuplicate?: (node: Node) => void;
    onDrop: (event: React.DragEvent) => void;
    onDragOver: (event: React.DragEvent) => void;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    onToggleNodePanel?: () => void;
    nodePanelOpen?: boolean;
}

export default function AgentCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onNodeClick,
    onPaneClick,
    onNodeDelete,
    onNodeDuplicate,
    onDrop,
    onDragOver,
    setEdges,
    onToggleNodePanel,
    nodePanelOpen,
}: AgentCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const handleConnect = useCallback(
        (params: Connection) => {
            setEdges((eds: Edge[]) =>
                addEdge(
                    {
                        ...params,
                        type: 'default',
                        animated: true,
                        style: { stroke: 'var(--muted-foreground)', strokeWidth: 2, opacity: 0.6 },
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: 'var(--muted-foreground)',
                            width: 15,
                            height: 15,
                        },
                    },
                    eds
                )
            );
        },
        [setEdges]
    );

    const onNodesDelete = useCallback(
        (deleted: Node[]) => {
            if (onNodeDelete) {
                deleted.forEach(node => onNodeDelete(node.id));
            }
        },
        [onNodeDelete]
    );

    return (
        <div ref={reactFlowWrapper} className="flex-1 h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={handleConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onNodesDelete={onNodesDelete}
                onDrop={onDrop}
                onDragOver={onDragOver}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={{
                    type: 'default',
                    animated: true,
                    style: { stroke: 'var(--muted-foreground)', strokeWidth: 2, opacity: 0.6 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: 'var(--muted-foreground)',
                        width: 15,
                        height: 15,
                    },
                }}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                className="bg-transparent"
                proOptions={{ hideAttribution: true }}
                minZoom={0.3}
                maxZoom={2}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1.5}
                    color="oklch(0.5 0 0 / 25%)"
                />
                <Panel position="bottom-right" className="!mb-[7.5rem] !mr-4 !z-50">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`w-8 h-8 rounded-full shadow-lg border border-border transition-all ${nodePanelOpen
                            ? 'bg-[var(--primary)]/20 text-[var(--primary)]'
                            : 'bg-card text-muted-foreground hover:bg-card/80 hover:text-foreground'
                            }`}
                        onClick={onToggleNodePanel}
                        style={
                            nodePanelOpen
                                ? { color: 'var(--primary)', background: 'var(--card)' }
                                : {}
                        }
                    >
                        <Zap className="w-4 h-4" />
                    </Button>
                </Panel>
                <Controls
                    position="bottom-right"
                    showInteractive={false}
                    className="mb-4 mr-4"
                />
                <MiniMap
                    position="bottom-right"
                    nodeStrokeWidth={3}
                    pannable
                    zoomable
                    className="!right-14 !bottom-4 !m-0"
                    style={{
                        backgroundColor: 'var(--card)',
                    }}
                    maskColor="oklch(0.1 0 0 / 70%)"
                />
            </ReactFlow>
        </div>
    );
}
