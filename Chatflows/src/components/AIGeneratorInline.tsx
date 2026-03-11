import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { type Node, type Edge, MarkerType } from '@xyflow/react';
import { createClient } from '@/utils/supabase/client';

interface AIGeneratorInlineProps {
    onGenerate: (nodes: Node[], edges: Edge[]) => void;
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
    "model": "gemini-flash-latest",
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

export default function AIGeneratorInline({ onGenerate }: AIGeneratorInlineProps) {
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    
    const supabase = createClient();

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
                alert("No Gemini API key found. Please add it first.");
                setIsGenerating(false);
                return;
            }

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`, {
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
            alert(error.message);
            console.error("AI Generation error:", error);
        } finally {
            setIsGenerating(false);
        }
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

