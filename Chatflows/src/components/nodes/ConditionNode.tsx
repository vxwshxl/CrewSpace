'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, NodeToolbar, useReactFlow } from '@xyflow/react';
import { GitBranch, GitMerge, Sparkles, Copy, Trash2, Info } from 'lucide-react';

const modelIcons: Record<string, { icon: React.ReactNode; color: string }> = {
    openai: {
        icon: <span className="text-[10px] font-bold">▲</span>,
        color: 'var(--muted-foreground)',
    },
    anthropic: {
        icon: <span className="text-[10px] font-bold">◉</span>,
        color: 'var(--muted-foreground)',
    },
    gemini: {
        icon: <Sparkles className="w-3 h-3" />,
        color: 'var(--muted-foreground)',
    },
};

function ConditionNode(props: NodeProps) {
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
                data: {
                    ...currentNode.data,
                    label: `${currentNode.data.label || 'Condition'} (Copy)`,
                    agentConfig: currentNode.data.agentConfig ? {
                        ...(currentNode.data.agentConfig as object),
                        id: newNodeId,
                        name: `${(currentNode.data.agentConfig as { name: string }).name} (Copy)`
                    } : undefined
                }
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

    const agentConfig = nodeData.agentConfig as {
        name: string;
        model: string;
        modelIcon: string;
    } | undefined;
    const label = (nodeData.label as string) || 'Condition';
    const name = agentConfig?.name || label;
    const model = agentConfig?.model || 'gpt-4.1';
    const iconKey = agentConfig?.modelIcon || 'openai';
    const modelInfo = modelIcons[iconKey] || modelIcons.openai;

    const nodeIcon = (nodeData.icon as string) || 'git-branch';
    const renderIcon = () => {
        if (nodeIcon === 'git-merge') {
            return <GitMerge className="w-5 h-5 text-white" />;
        }
        return <GitBranch className="w-5 h-5 text-white" />;
    };

    return (
        <div className="group relative">
            <NodeToolbar isVisible={selected} position={Position.Top} offset={10}>
                <div className="flex gap-1 bg-card border border-border rounded-lg p-1 shadow-lg">
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

            <Handle
                type="target"
                position={Position.Left}
                id="condition-in"
                className="!bg-[var(--chart-4)] !border-[var(--chart-4)]"
            />

            <div
                className={`
          relative rounded-xl border-2 px-5 py-4 min-w-[220px] transition-all duration-300
          ${selected ? 'scale-105' : 'hover:scale-[1.02]'}
        `}
                style={{
                    background: 'oklch(0.16 0 0)',
                    borderColor: selected ? 'var(--chart-4)' : 'var(--border)',
                    boxShadow: selected
                        ? '0 0 25px oklch(0.627 0.265 303.9 / 25%)'
                        : '0 0 15px oklch(0.627 0.265 303.9 / 8%)',
                }}
            >
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ background: 'var(--chart-4)' }}
                    >
                        {renderIcon()}
                    </div>
                    <span className="text-foreground font-bold text-sm">{name}</span>
                </div>

                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                            background: 'var(--card)',
                            color: modelInfo.color,
                            border: '1px solid var(--border)',
                        }}
                    >
                        {modelInfo.icon}
                        <span>{model}</span>
                    </div>
                </div>
            </div>

            {/* Multiple output handles with port numbers */}
            <Handle
                type="source"
                position={Position.Right}
                id="condition-out-0"
                style={{ top: '25%' }}
                className="!bg-[var(--chart-4)] !border-[var(--chart-4)]"
            />
            <div className="absolute right-[-18px] text-[10px] font-mono" style={{ top: '22%', color: 'var(--muted-foreground)' }}>0</div>

            <Handle
                type="source"
                position={Position.Right}
                id="condition-out-1"
                style={{ top: '50%' }}
                className="!bg-[var(--chart-4)] !border-[var(--chart-4)]"
            />
            <div className="absolute right-[-18px] text-[10px] font-mono" style={{ top: '47%', color: 'var(--muted-foreground)' }}>1</div>

            <Handle
                type="source"
                position={Position.Right}
                id="condition-out-2"
                style={{ top: '75%' }}
                className="!bg-[var(--chart-4)] !border-[var(--chart-4)]"
            />
            <div className="absolute right-[-18px] text-[10px] font-mono" style={{ top: '72%', color: 'var(--muted-foreground)' }}>2</div>
        </div>
    );
}

export default memo(ConditionNode);
