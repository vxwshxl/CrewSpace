'use client';

import React, { useState } from 'react';
import { Pencil, Info, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { AgentConfig } from '@/lib/types';
import { tools } from '@/lib/mock-data';

interface ConfigPanelProps {
    agent: AgentConfig | null;
    onUpdate: (agent: AgentConfig) => void;
    onClose: () => void;
}

export default function ConfigPanel({ agent, onUpdate, onClose }: ConfigPanelProps) {
    const [editingName, setEditingName] = useState(false);

    if (!agent) return null;

    const handleNameChange = (value: string) => {
        onUpdate({ ...agent, name: value });
    };

    const handleModelChange = (value: string | null) => {
        if (value) onUpdate({ ...agent, model: value });
    };

    const handleMemoryToggle = (checked: boolean) => {
        onUpdate({ ...agent, memoryEnabled: checked });
    };

    const handleMemoryTypeChange = (value: string | null) => {
        if (value) onUpdate({ ...agent, memoryType: value });
    };

    const handleToolToggle = (toolId: string) => {
        const newTools = agent.tools.includes(toolId)
            ? agent.tools.filter((t) => t !== toolId)
            : [...agent.tools, toolId];
        onUpdate({ ...agent, tools: newTools });
    };

    return (
        <div
            className="w-[380px] h-full border-l flex flex-col animate-fade-in-up bg-black/40 backdrop-blur-xl shadow-xl z-10"
            style={{
                borderColor: 'var(--border)',
            }}
        >
            <ScrollArea className="flex-1">
                <div className="p-5 space-y-6">
                    {/* Agent Name */}
                    <div className="flex items-center gap-2">
                        {editingName ? (
                            <Input
                                value={agent.name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                onBlur={() => setEditingName(false)}
                                onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                                autoFocus
                                className="text-lg font-bold h-8 px-1 border-none bg-transparent text-white"
                            />
                        ) : (
                            <>
                                <h2 className="text-lg font-bold text-white">{agent.name}</h2>
                                <button
                                    onClick={() => setEditingName(true)}
                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                                    style={{
                                        background: 'var(--card)',
                                        color: 'var(--muted-foreground)',
                                    }}
                                >
                                    <Pencil className="w-3 h-3" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Model */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label className="text-sm font-medium text-white">Model</Label>
                            <span className="text-red-400 text-sm">*</span>
                        </div>
                        <Select value={agent.model} onValueChange={handleModelChange}>
                            <SelectTrigger
                                className="w-full h-10 border rounded-lg"
                                style={{
                                    background: 'var(--card)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--card-foreground)',
                                }}
                            >
                                <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent
                                style={{
                                    background: 'var(--card)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                <SelectItem value="gemini-flash-latest">Gemini Flash</SelectItem>
                                <SelectItem value="sarvam">Sarvam</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Messages */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">Messages</Label>
                        <Button
                            variant="outline"
                            className="w-full h-10 border-dashed text-sm"
                            style={{
                                borderColor: 'var(--primary)',
                                color: 'var(--primary)',
                                background: 'transparent',
                            }}
                        >
                            + Add Messages
                        </Button>
                    </div>

                    {/* Tools */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">Tools</Label>
                        <div className="space-y-1.5">
                            {agent.tools.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {agent.tools.map((toolId) => {
                                        const tool = tools.find((t) => t.id === toolId);
                                        return (
                                            <Badge
                                                key={toolId}
                                                variant="secondary"
                                                className="text-xs cursor-pointer hover:bg-red-500/20 transition-colors"
                                                style={{
                                                    background: 'var(--muted)',
                                                    color: 'var(--primary)',
                                                    borderColor: 'var(--primary)',
                                                }}
                                                onClick={() => handleToolToggle(toolId)}
                                            >
                                                {tool?.name || toolId} ×
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}
                            <Button
                                variant="outline"
                                className="w-full h-10 border-dashed text-sm"
                                style={{
                                    borderColor: 'var(--primary)',
                                    color: 'var(--primary)',
                                    background: 'transparent',
                                }}
                                onClick={() => {
                                    /* Tool selector would open */
                                }}
                            >
                                + Add Tools
                            </Button>
                        </div>

                        {/* Quick tool list */}
                        <div className="mt-3 space-y-1">
                            {tools.map((tool) => (
                                <div
                                    key={tool.id}
                                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                                    onClick={() => handleToolToggle(tool.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-5 h-5 rounded flex items-center justify-center text-[10px]"
                                            style={{
                                                background: agent.tools.includes(tool.id)
                                                    ? 'rgba(140, 82, 255, 0.3)'
                                                    : 'oklch(0.25 0 0)',
                                                color: agent.tools.includes(tool.id)
                                                    ? 'var(--primary)'
                                                    : 'oklch(0.5 0 0)',
                                            }}
                                        >
                                            {agent.tools.includes(tool.id) ? '✓' : '+'}
                                        </div>
                                        <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
                                            {tool.name}
                                        </span>
                                    </div>
                                    <span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                                        {tool.category}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Knowledge */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5">
                            <Label className="text-sm font-medium text-white">Knowledge (Document Stores)</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">Connect document stores for RAG-based knowledge</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Button
                            variant="outline"
                            className="w-full h-10 border-dashed text-sm"
                            style={{
                                borderColor: 'var(--primary)',
                                color: 'var(--primary)',
                                background: 'transparent',
                            }}
                        >
                            + Add Knowledge (Document Stores)
                        </Button>
                    </div>

                    {/* Enable Memory */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                            <Label className="text-sm font-medium text-white">Enable Memory</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs">Enable conversation memory for this agent</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Switch
                            checked={agent.memoryEnabled}
                            onCheckedChange={handleMemoryToggle}
                            className="data-[state=checked]:bg-[var(--secondary)]"
                        />
                    </div>

                    {/* Memory Type */}
                    {agent.memoryEnabled && (
                        <div className="space-y-2 animate-fade-in-up">
                            <Label className="text-sm font-medium text-white">Memory Type</Label>
                            <Select value={agent.memoryType} onValueChange={handleMemoryTypeChange}>
                                <SelectTrigger
                                    className="w-full h-10 border rounded-lg"
                                    style={{
                                        background: 'var(--card)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--card-foreground)',
                                    }}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <SelectValue />
                                        <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent
                                    style={{
                                        background: 'var(--card)',
                                        borderColor: 'var(--border)',
                                    }}
                                >
                                    <SelectItem value="All Messages">All Messages</SelectItem>
                                    <SelectItem value="Window Buffer">Window Buffer</SelectItem>
                                    <SelectItem value="Summary">Summary</SelectItem>
                                    <SelectItem value="Token Buffer">Token Buffer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Input Message */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                                <Label className="text-sm font-medium text-white">Input Message</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Info className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">The input message to send to this agent</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono" style={{ color: 'var(--muted-foreground)' }}>
                                    {'(x)'}
                                </span>
                                <button className="p-0.5 hover:bg-white/10 rounded">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--muted-foreground)' }}>
                                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <Textarea
                            placeholder="Enter input message..."
                            className="min-h-[80px] border rounded-lg text-sm resize-none"
                            style={{
                                background: 'var(--card)',
                                borderColor: 'var(--border)',
                                color: 'var(--card-foreground)',
                            }}
                        />
                    </div>

                    {/* Return Response As */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-1">
                            <Label className="text-sm font-medium text-white">Return Response As</Label>
                            <span className="text-red-400 text-sm">*</span>
                        </div>
                        <Select value={agent.responseFormat} onValueChange={(v) => { if (v) onUpdate({ ...agent, responseFormat: v }); }}>
                            <SelectTrigger
                                className="w-full h-10 border rounded-lg"
                                style={{
                                    background: 'var(--card)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--card-foreground)',
                                }}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent
                                style={{
                                    background: 'var(--card)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                <SelectItem value="Use Markdown">Use Markdown</SelectItem>
                                <SelectItem value="Plain Text">Plain Text</SelectItem>
                                <SelectItem value="JSON">JSON</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </ScrollArea >
        </div >
    );
}
