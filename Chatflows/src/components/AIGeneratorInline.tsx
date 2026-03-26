import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { type Node, type Edge, MarkerType } from '@xyflow/react';
import { createClient } from '@/utils/supabase/client';

interface AIGeneratorInlineProps {
    onGenerate: (nodes: Node[], edges: Edge[]) => void;
    onError?: (message: string) => void;
}

const SYSTEM_PROMPT = `You are an expert chatflow workflow generator. The user will describe a workflow, and you must generate the corresponding nodes and edges for a ReactFlow canvas.
You MUST format your response as a valid JSON object matching this structure:
{
  "nodes": [...],
  "edges": [...]
}

Available node types:
- "start": The starting point (use only one, typically at the beginning). Label it based on the trigger.
- "agent": An AI agent node. Make sure to generate detailed and tailored system prompts, roles, and personalities based on the user's request.
- "condition": An if/else logical split that checks a condition.
- "sticky": A note node to explain parts of the workflow.

Node structure guidelines:
Every node must have an "id" (string, e.g., "node-start", "node-agent-1"), a "type" (one of the above), and a "position" object { "x": number, "y": number }.
Space the nodes linearly: start at x=100, and add 300 to x for each subsequent step in the flow. Keep y around 150 (or 50 for sticky notes).

The "data" property for nodes MUST be structured as follows:
For all nodes: { "label": "Short Title", "nodeType": "...", "originalType": "...", "icon": "...", "status": "idle" }
Icons: start="play", agent="bot", condition="git-branch", sticky="sticky-note"

For "sticky" nodes, also add: { "content": "Your note here" }

For "agent" nodes, ALSO add:
{
  "agentConfig": {
    "id": same as node id,
    "name": same as label,
    "role": "Specific role, e.g., Data Analyst",
    "personality": "Specific personality, e.g., Professional and concise",
    "model": "gemini-pro-latest",
    "modelIcon": "gemini",
    "tools": [],
    "memoryEnabled": false,
    "memoryType": "All Messages",
    "messages": [],
    "knowledgeSources": [],
    "inputMessage": "",
    "responseFormat": "Use Markdown",
    "systemPrompt": "System instructions here"
  }
}

Edge structure guidelines:
{
  "id": "edge-source-target",
  "source": "source-node-id",
  "target": "target-node-id",
  "type": "default",
  "animated": true,
  "style": { "stroke": "var(--muted-foreground)", "strokeWidth": 2, "opacity": 0.6 },
  "markerEnd": { "type": "arrowclosed", "color": "var(--muted-foreground)", "width": 15, "height": 15 }
}

Connect the nodes logically according to the user's workflow description. Always ensure a clean connection from start to the agents and conditions.`;

const EXAMPLES = [
    'A research agent that summarizes news...',
    'An Amazon order assistant agent...',
    'A content writer with SEO skills...',
    'Multi-agent customer support crew...',
];

export default function AIGeneratorInline({ onGenerate, onError }: AIGeneratorInlineProps) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [typewriterText, setTypewriterText] = useState('');
    const [typewriterIndex, setTypewriterIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        if (prompt) return; // pause when user is typing
        const current = EXAMPLES[typewriterIndex];
        let timeout: ReturnType<typeof setTimeout>;

        if (!isDeleting && charIndex < current.length) {
            timeout = setTimeout(() => setCharIndex(c => c + 1), 45);
        } else if (!isDeleting && charIndex === current.length) {
            timeout = setTimeout(() => setIsDeleting(true), 1400);
        } else if (isDeleting && charIndex > 0) {
            timeout = setTimeout(() => setCharIndex(c => c - 1), 22);
        } else if (isDeleting && charIndex === 0) {
            setIsDeleting(false);
            setTypewriterIndex(i => (i + 1) % EXAMPLES.length);
        }

        setTypewriterText(current.slice(0, charIndex));
        return () => clearTimeout(timeout);
    }, [charIndex, isDeleting, typewriterIndex, prompt]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        
        setIsGenerating(true);
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");
            
            const { data: keysDb } = await supabase
                .from('apiKeys')
                .select('*')
                .eq('user_id', user.id)
                .eq('provider', 'gemini');
                
            const geminiKey = keysDb?.[0]?.key;
            if (!geminiKey) {
                const msg = 'No Gemini API key found. Please add one in your API Keys settings.';
                onError ? onError(msg) : alert(msg);
                setIsGenerating(false);
                return;
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    generationConfig: { responseMimeType: 'application/json' }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || "Generation failed");
            }

            const data = await response.json();
            let jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!jsonText) throw new Error("No content generated");
            
            // Just in case there are markdown blocks
            jsonText = jsonText.replace(/^\s*```json/i, '').replace(/```\s*$/, '').trim();

            const parsed = JSON.parse(jsonText);
            
            // Validate and prepare nodes and edges
            const newNodes: Node[] = parsed.nodes || [];
            const newEdges: Edge[] = (parsed.edges || []).map((e: Edge) => ({
                ...e,
                type: 'deletable',
                animated: true,
                style: { stroke: 'var(--muted-foreground)', strokeWidth: 2, opacity: 0.6 },
                markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--muted-foreground)', width: 15, height: 15 }
            }));

            // Assign unique suffix to generated ids to prevent clashes
            const uuidSuffix = `-${Date.now()}`;
            const idMap: Record<string, string> = {};
            
            newNodes.forEach(node => {
                const oldId = node.id;
                const newId = `${oldId}${uuidSuffix}`;
                idMap[oldId] = newId;
                node.id = newId;
                if (node.data?.agentConfig) {
                    (node.data.agentConfig as any).id = newId;
                }
            });

            newEdges.forEach(edge => {
                edge.id = `${edge.id}${uuidSuffix}`;
                if (idMap[edge.source]) edge.source = idMap[edge.source];
                if (idMap[edge.target]) edge.target = idMap[edge.target];
            });

            setPrompt('');
            onGenerate(newNodes, newEdges);
        } catch (error: any) {
            const msg = error.message || 'Something went wrong.';
            onError ? onError(msg) : alert(msg);
            console.error("AI Generation error:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-[280px] bg-card border border-border shadow-xl animate-fade-in-up flex flex-col">
            {/* Header - visually separated */}
            <div className="px-4 py-3 flex items-center gap-2 bg-primary/10 border-b border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Generate with AI</span>
            </div>

            {/* Input area */}
            <div className="p-3">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={typewriterText || ' '}
                        rows={3}
                        className="w-full p-3 pr-10 text-sm text-white resize-none focus:outline-none caret-primary placeholder:text-primary/60 transition-all"
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
                        className="absolute bottom-3 right-3 p-1.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>
        </div>
    );
}
