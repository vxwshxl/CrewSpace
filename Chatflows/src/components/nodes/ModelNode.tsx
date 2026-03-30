'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, NodeToolbar, useReactFlow } from '@xyflow/react';
import { Bot, Copy, Trash2, Info } from 'lucide-react';
import ConnectedHandle from './ConnectedHandle';

function ModelNode(props: NodeProps) {
    const { data, selected } = props;
    const nodeData = data as Record<string, unknown>;
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
                selected: false,
                data: { ...currentNode.data }
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

    const label = (nodeData.label as string) || 'Chat Model';

    const outlineColor = 'rgba(168, 85, 247, 0.8)'; // Purple vibe for models
    const shadowColor = 'oklch(0.6 0.2 300)';

    return (
        <div className="group relative flex flex-col items-center justify-center">
            <NodeToolbar isVisible={selected} position={Position.Right} offset={10}>
                <div className="flex flex-col gap-1 bg-card border border-border rounded-lg p-1 shadow-lg">
                    <button onClick={handleDuplicate} className="p-1.5 hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors rounded">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={handleDelete} className="p-1.5 hover:bg-destructive/20 text-destructive transition-colors rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </NodeToolbar>

            <ConnectedHandle
                type="source"
                position={Position.Top}
                id="model-out"
                nodeId={id}
                fillColor="rgba(168,85,247,0.9)"
                style={{ top: -14 }}
            />

            <div
                className={`
          relative rounded-full border-2 flex items-center justify-center w-16 h-16 transition-all duration-300 bg-card
        `}
                style={{
                    borderColor: selected ? outlineColor : 'var(--border)',
                    boxShadow: selected
                        ? `0 0 25px ${shadowColor} / 25%)`
                        : `0 0 15px ${shadowColor} / 8%)`,
                }}
            >
                <Bot className="w-6 h-6 text-white" />
            </div>

            <div className="absolute top-[72px] left-1/2 -translate-x-1/2 text-xs font-semibold text-card-foreground text-center w-48 truncate">
                {label}
            </div>
            
            <div className="absolute top-[88px] left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground text-center w-48 truncate">
                {nodeData.description as string || "gemini-pro-latest"}
            </div>
        </div>
    );
}

export default memo(ModelNode);
