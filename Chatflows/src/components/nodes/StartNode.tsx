'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, NodeToolbar, useReactFlow } from '@xyflow/react';
import { Play, Copy, Trash2, Info } from 'lucide-react';
import ConnectedHandle from './ConnectedHandle';

function StartNode(props: NodeProps) {
    const { data, selected } = props;
    const { id } = props;
    const { setNodes, setEdges } = useReactFlow();

    // Duplicate handler
    const handleDuplicate = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newNodeId = `node-${Date.now()}`;
        setNodes((nds) => {
            const currentNode = nds.find(n => n.id === id);
            if (!currentNode) return nds;
            const newNode = {
                ...currentNode,
                id: newNodeId,
                position: { x: currentNode.position.x + 50, y: currentNode.position.y + 50 },
                selected: false
            };
            return [...nds, newNode];
        });
    };

    // Delete handler
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) => eds.filter(edge => edge.source !== id && edge.target !== id));
    };

    // Info handler logic just acts as click
    const handleInfo = (e: React.MouseEvent) => {
        // Handled by the canvas onNodeClick but we can trigger a focus if needed
        // For now, it will just select the node
    };

    const isCompleted = (data as Record<string, unknown>).status === 'completed';

    return (
        <div className="group relative">
            <NodeToolbar isVisible={selected} position={Position.Top} offset={10}>
                <div className="flex gap-1 bg-card border border-border rounded-full p-1 shadow-lg">
                    <button onClick={handleDuplicate} className="p-1.5 hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors rounded">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={handleDelete} className="p-1.5 hover:bg-destructive/20 text-destructive transition-colors rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={handleInfo} className="p-1.5 hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors rounded">
                        <Info className="w-4 h-4" />
                    </button>
                </div>
            </NodeToolbar>

            <div
                className={`flex items-center gap-3 px-5 py-3 border-2 transition-all duration-300`}
                style={{
                    background: 'oklch(0.16 0 0)',
                    borderColor: selected ? 'var(--chart-2)' : 'var(--border)',
                    boxShadow: selected ? '0 0 25px oklch(0.696 0.17 162.48 / 25%)' : '0 0 15px oklch(0.696 0.17 162.48 / 8%)',
                }}
            >
                <div
                    className="w-8 h-8 flex items-center justify-center"
                    style={{ background: 'var(--chart-2)' }}
                >
                    <Play className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="text-foreground font-semibold text-sm">Start</span>

                {isCompleted && (
                    <div
                        className="absolute -top-2 -left-2 w-5 h-5 rounded-full flex items-center justify-center text-black text-xs font-bold"
                        style={{ background: 'var(--secondary)', border: '2px solid black' }}
                    >
                        ✓
                    </div>
                )}
            </div>

            <ConnectedHandle
                type="source"
                position={Position.Right}
                id="start-out"
                nodeId={id}
                fillColor="var(--chart-2)"
                style={{ right: -14, left: 'auto' }}
            />
        </div>
    );
}

export default memo(StartNode);
