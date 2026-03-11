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
import {
    Zap,
    Sparkles,
    Search,
    Calculator,
    CheckSquare,
    Globe,
    FileText,
    Mail,
    Bot,
    GitBranch,
    Workflow,
    Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import '@xyflow/react/dist/style.css';

import StartNode from './nodes/StartNode';
import AgentNode from './nodes/AgentNode';
import ConditionNode from './nodes/ConditionNode';
import StickyNode from './nodes/StickyNode';
import ToolNode from './nodes/ToolNode';
import ModelNode from './nodes/ModelNode';
import MemoryNode from './nodes/MemoryNode';
import NodePanel from './NodePanel';
import AIGeneratorInline from './AIGeneratorInline';
import { useStore } from '@xyflow/react';
import DeletableEdge from './edges/DeletableEdge';

function ZoomIndicator() {
    const zoom = useStore((s) => s.transform[2]);
    return (
        <div className="flex items-center justify-center w-12 h-8 rounded-lg shadow-lg border text-xs font-mono font-medium tracking-tight bg-card border-border text-muted-foreground mr-1.5">
            {Math.round(zoom * 100)}%
        </div>
    );
}

const nodeTypes = {
    start: StartNode,
    agent: AgentNode,
    condition: ConditionNode,
    sticky: StickyNode,
    tool: ToolNode,
    model: ModelNode,
    memory: MemoryNode,
};

const edgeTypes = {
    deletable: DeletableEdge,
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
    onDragStart: (event: React.DragEvent, nodeType: string, label: string, icon: string) => void;
    setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
    onAIGenerate?: (nodes: Node[], edges: Edge[]) => void;
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
    onDragStart,
    setEdges,
    onAIGenerate,
}: AgentCanvasProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);

    const handleConnect = useCallback(
        (params: Connection) => {
            setEdges((eds: Edge[]) =>
                addEdge(
                    {
                        ...params,
                        type: 'deletable',
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

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'gemini': return <Bot className="w-4 h-4" />;
            case 'git-branch': return <GitBranch className="w-4 h-4" />;
            case 'workflow': return <Workflow className="w-4 h-4" />;
            case 'globe': return <Globe className="w-4 h-4" />;
            case 'play': return <Play className="w-4 h-4" />;
            case 'search': return <Search className="w-4 h-4" />;
            case 'file-text': return <FileText className="w-4 h-4" />;
            case 'mail': return <Mail className="w-4 h-4" />;
            case 'check-square': return <CheckSquare className="w-4 h-4" />;
            case 'calculator': return <Calculator className="w-4 h-4" />;
            default: return <Bot className="w-4 h-4" />;
        }
    };

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
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{
                    type: 'deletable',
                    animated: true,
                    style: { stroke: 'var(--muted-foreground)', strokeWidth: 2, opacity: 0.6 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: 'var(--muted-foreground)',
                        width: 15,
                        height: 15,
                    },
                }}
                className="bg-transparent"
                proOptions={{ hideAttribution: true }}
                minZoom={0.3}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={20}
                    size={1.5}
                    color="oklch(0.5 0 0 / 25%)"
                />
                <Panel position="top-left" className="!mt-4 !ml-4 !z-50 flex flex-col gap-2">
                    {onAIGenerate && <AIGeneratorInline onGenerate={onAIGenerate} />}
                    <NodePanel onDragStart={onDragStart} />
                </Panel>
                <Panel position="bottom-left" className="!mb-4 !ml-4 !z-50 flex items-center gap-2">
                    <ZoomIndicator />
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
