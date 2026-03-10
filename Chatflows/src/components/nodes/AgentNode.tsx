'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, NodeToolbar, useReactFlow } from '@xyflow/react';
import { Bot, Sparkles, CheckCircle2, Copy, Trash2, Info, GitMerge, Code, MessageCircle, Workflow, Globe } from 'lucide-react';

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
    google: {
        icon: <span className="text-[10px] font-bold">G</span>,
        color: 'var(--muted-foreground)',
    },
};

function AgentNode(props: NodeProps) {
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
        tools: string[];
    } | undefined;
    const status = nodeData.status as string | undefined;
    const label = (nodeData.label as string) || 'Agent';

    const name = agentConfig?.name || label;
    const model = agentConfig?.model || 'gpt-4o';
    const iconKey = agentConfig?.modelIcon || 'openai';
    const tools = agentConfig?.tools || [];
    const modelInfo = modelIcons[iconKey] || modelIcons.openai;
    const isCompleted = status === 'completed';
    const isRunning = status === 'running';

    const originalType = (nodeData.originalType as string) || 'agent';
    const nodeIcon = (nodeData.icon as string) || 'bot';

    const colorMap: Record<string, string> = {
        agent: 'var(--chart-1)',
        condition: 'var(--chart-4)',
        start: 'var(--chart-2)',
        function: 'var(--chart-2)',
        reply: 'var(--chart-2)',
        flow: 'var(--chart-2)',
        http: 'var(--chart-2)',
    };
    const outlineColor = colorMap[originalType] || 'var(--chart-1)';

    const shadowColorMap: Record<string, string> = {
        agent: 'oklch(0.488 0.243 264.376',
        condition: 'oklch(0.627 0.265 303.9',
        start: 'oklch(0.696 0.17 162.48',
        function: 'oklch(0.696 0.17 162.48',
        reply: 'oklch(0.696 0.17 162.48',
        flow: 'oklch(0.696 0.17 162.48',
        http: 'oklch(0.696 0.17 162.48',
    };
    const shadowColor = shadowColorMap[originalType] || 'oklch(0.488 0.243 264.376';

    const renderIcon = () => {
        switch (nodeIcon) {
            case 'bot': return <Bot className="w-5 h-5 text-white" />;
            case 'git-merge': return <GitMerge className="w-5 h-5 text-white" />;
            case 'code': return <Code className="w-5 h-5 text-white" />;
            case 'message-circle': return <MessageCircle className="w-5 h-5 text-white" />;
            case 'workflow': return <Workflow className="w-5 h-5 text-white" />;
            case 'globe': return <Globe className="w-5 h-5 text-white" />;
            default: return <Bot className="w-5 h-5 text-white" />;
        }
    };

    let handleColorClass = '!bg-[var(--chart-1)] !border-[var(--chart-1)]';
    if (originalType === 'function' || originalType === 'reply' || originalType === 'flow' || originalType === 'http') {
        handleColorClass = '!bg-[var(--chart-2)] !border-[var(--chart-2)]';
    }

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
                id="agent-in"
                className={handleColorClass}
            />

            <div
                className={`
          relative rounded-xl border-2 px-5 py-4 min-w-[200px] transition-all duration-300
          ${selected ? 'scale-105' : 'hover:scale-[1.02]'}
          ${isRunning ? 'status-running' : ''}
        `}
                style={{
                    background: 'oklch(0.16 0 0)',
                    borderColor: selected ? outlineColor : 'var(--border)',
                    boxShadow: selected
                        ? `0 0 25px ${shadowColor} / 25%)`
                        : `0 0 15px ${shadowColor} / 8%)`,
                }}
            >
                {/* Status indicator */}
                {isCompleted && (
                    <div className="absolute -top-2 -right-2">
                        <CheckCircle2
                            className="w-5 h-5"
                            style={{ color: 'var(--secondary)' }}
                            fill="var(--secondary)"
                            strokeWidth={0}
                        />
                        <CheckCircle2
                            className="w-5 h-5 absolute top-0 left-0 text-black"
                            strokeWidth={2.5}
                            fill="none"
                            style={{ color: 'oklch(0.17 0.02 260)' }}
                        />
                        <svg className="w-5 h-5 absolute top-0 left-0" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" fill="var(--secondary)" />
                            <path d="M8 12.5l2.5 2.5 5.5-5.5" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                    </div>
                )}

                {/* Robot icon + name */}
                <div className="flex items-center gap-3 mb-3">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                            background: outlineColor,
                        }}
                    >
                        {renderIcon()}
                    </div>
                    <span className="text-foreground font-bold text-sm">{name}</span>
                </div>

                {/* Model badge */}
                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                            background: 'var(--card)',
                            color: modelInfo.color,
                            border: `1px solid oklch(1 0 0 / 10%)`,
                        }}
                    >
                        {modelInfo.icon}
                        <span>{model}</span>
                    </div>
                </div>

                {/* Tool icons */}
                {tools.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2.5">
                        {tools.includes('web-search') && (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{ background: 'var(--card)', color: 'var(--muted-foreground)' }}>
                                G
                            </div>
                        )}
                        {tools.filter(t => t !== 'web-search').slice(0, 3).map((tool, i) => (
                            <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--card)', color: 'var(--muted-foreground)' }}>
                                <span className="text-[10px]">🔧</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Handle
                type="source"
                position={Position.Right}
                id="agent-out-0"
                style={{ top: '35%' }}
                className={handleColorClass}
            />
            <Handle
                type="source"
                position={Position.Right}
                id="agent-out-1"
                style={{ top: '65%' }}
                className={handleColorClass}
            />
        </div>
    );
}

export default memo(AgentNode);
