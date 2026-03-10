import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { type Node, type Edge, MarkerType } from '@xyflow/react';

interface AIGeneratorInlineProps {
    onGenerate: (nodes: Node[], edges: Edge[]) => void;
}

export default function AIGeneratorInline({ onGenerate }: AIGeneratorInlineProps) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        // Simulate Gemini generating the flow
        await new Promise((resolve) => setTimeout(resolve, 2500));

        // Create a mocked AI generated workflow
        const startId = `node-start-${Date.now()}`;
        const agentId = `node-agent-${Date.now()}`;
        const conditionId = `node-condition-${Date.now()}`;
        const stickyId = `node-sticky-${Date.now()}`;

        const newNodes: Node[] = [
            {
                id: startId,
                type: 'start',
                position: { x: 100, y: 150 },
                data: {
                    label: 'Manual Trigger',
                    nodeType: 'start',
                    originalType: 'start',
                    icon: 'play',
                    status: 'idle',
                },
            },
            {
                id: agentId,
                type: 'agent',
                position: { x: 400, y: 150 },
                data: {
                    label: 'Workflow AI',
                    nodeType: 'agent',
                    originalType: 'agent',
                    icon: 'bot',
                    status: 'idle',
                    agentConfig: {
                        id: agentId,
                        name: 'Workflow AI',
                        role: 'Processes the user request',
                        personality: 'Helpful expert',
                        model: 'gemini-flash-latest',
                        modelIcon: 'gemini',
                        tools: [],
                        memoryEnabled: false,
                        memoryType: 'All Messages',
                        messages: [],
                        knowledgeSources: [],
                        inputMessage: '',
                        responseFormat: 'Use Markdown',
                    },
                },
            },
            {
                id: conditionId,
                type: 'condition',
                position: { x: 700, y: 150 },
                data: {
                    label: 'Check Success',
                    nodeType: 'condition',
                    originalType: 'condition',
                    icon: 'git-branch',
                    status: 'idle',
                },
            },
            {
                id: stickyId,
                type: 'sticky',
                position: { x: 400, y: 50 },
                data: {
                    label: 'Notes',
                    content: 'Generated using Prompt:\n' + prompt,
                    nodeType: 'sticky',
                    originalType: 'sticky',
                    icon: 'sticky-note',
                },
            },
        ];

        const newEdges: Edge[] = [
            {
                id: `e-${startId}-${agentId}`,
                source: startId,
                target: agentId,
                type: 'default',
                animated: true,
                style: { stroke: 'var(--muted-foreground)', strokeWidth: 2, opacity: 0.6 },
                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--muted-foreground)', width: 15, height: 15 },
            },
            {
                id: `e-${agentId}-${conditionId}`,
                source: agentId,
                target: conditionId,
                type: 'default',
                animated: true,
                style: { stroke: 'var(--muted-foreground)', strokeWidth: 2, opacity: 0.6 },
                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--muted-foreground)', width: 15, height: 15 },
            },
        ];

        setIsGenerating(false);
        setPrompt('');
        onGenerate(newNodes, newEdges);
    };

    return (
        <div className="w-[260px] bg-card border border-border shadow-lg rounded-xl overflow-hidden animate-fade-in-up flex flex-col">
             <div className="px-3 py-2 border-b border-border flex items-center gap-2 bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Generate with AI</span>
            </div>
            <div className="p-2 relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your workflow..."
                    className="w-full min-h-[80px] p-3 pr-10 rounded-lg bg-black/40 border border-border text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground transition-all"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleGenerate();
                        }
                    }}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="absolute bottom-4 right-4 p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
            </div>
        </div>
    );
}
