'use client';

import React, { useState } from 'react';
import { Pencil, Info, ChevronDown, Check, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
    nodeType?: string;
    onUpdate: (agent: AgentConfig) => void;
    onClose: () => void;
}

export default function ConfigPanel({ agent, nodeType = 'agent', onUpdate, onClose }: ConfigPanelProps) {
    const [editingName, setEditingName] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

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

    const handleInputChange = (value: string) => {
        onUpdate({ ...agent, inputMessage: value });
    };

    const handlePromptChange = (value: string) => {
        onUpdate({ ...agent, prompt: value });
    };

    const simulateGenerateCode = (type: 'condition' | 'function') => {
        if (!agent.prompt?.trim()) return;
        setIsGenerating(true);
        setTimeout(() => {
            let genCode = '';
            if (type === 'condition') {
                genCode = `input.toLowerCase().includes("${agent.prompt?.toLowerCase().trim()}")`;
            } else {
                genCode = `// Generated for: ${agent.prompt}\nreturn {\n  result: true,\n  message: "Finished processing"\n};`;
            }
            onUpdate({ ...agent, inputMessage: genCode });
            setIsGenerating(false);
        }, 1000);
    };

    const renderAgentSpecific = () => (
        <>
            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <Label className="text-sm font-medium text-white">Model</Label>
                    <span className="text-red-400 text-sm">*</span>
                </div>
                <Select value={agent.model} onValueChange={handleModelChange}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="gemini-flash-latest">gemini-flash-latest</SelectItem>
                        <SelectItem value="sarvam-m">sarvam-m</SelectItem>
                        <SelectItem value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                                        className="text-xs cursor-pointer bg-muted text-primary border-primary hover:bg-red-500/20"
                                        onClick={() => handleToolToggle(toolId)}
                                    >
                                        {tool?.name || toolId} ×
                                    </Badge>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-3 space-y-1">
                    {tools.map((tool) => (
                        <div
                            key={tool.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => handleToolToggle(tool.id)}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded flex items-center justify-center text-[10px] ${agent.tools.includes(tool.id) ? 'bg-primary/30 text-primary' : 'bg-black/25 text-muted-foreground'}`}>
                                    {agent.tools.includes(tool.id) ? '✓' : '+'}
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{tool.name}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{tool.category}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-medium text-white">Enable Memory</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">Enable conversation memory</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Switch
                    checked={agent.memoryEnabled}
                    onCheckedChange={handleMemoryToggle}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">System Prompt / Instructions</Label>
                <Textarea
                    placeholder="Enter instructions..."
                    value={agent.prompt || ''}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    className="min-h-[120px] bg-card border-border text-xs resize-y"
                />
            </div>
        </>
    );

    const renderConditionConfig = () => (
        <>
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-medium text-white">Javascript Conditional Expression</Label>
                </div>
                <Textarea
                    placeholder="input.includes('urgent')"
                    value={agent.inputMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="font-mono text-xs min-h-[80px] bg-card border-border resize-y"
                    disabled={isGenerating}
                />
            </div>

            <div className="flex items-center gap-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest">OR</span>
                <div className="h-px bg-border flex-1" />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-white flex items-center gap-1.5 justify-between">
                    <span>Prompt</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">We will write the javascript for you.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>
                <div className="relative">
                    <Textarea
                        placeholder="Describe your condition in simple words..."
                        value={agent.prompt || ''}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        className="min-h-[60px] bg-card border-border resize-none text-xs pr-10"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                simulateGenerateCode('condition');
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => simulateGenerateCode('condition')}
                        disabled={isGenerating || !agent.prompt}
                        className="absolute right-1 bottom-1 h-6 w-6 text-primary hover:text-primary hover:bg-primary/20"
                    >
                        {isGenerating ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    </Button>
                </div>
            </div>
        </>
    );

    const renderFunctionConfig = () => (
        <>
            <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                    <Label className="text-sm font-medium text-white">Javascript Function Code</Label>
                </div>
                <Textarea
                    placeholder="return { result: true };"
                    value={agent.inputMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="font-mono text-xs min-h-[160px] bg-card border-border resize-y"
                    disabled={isGenerating}
                />
            </div>

            <div className="flex items-center gap-2">
                <div className="h-px bg-border flex-1" />
                <span className="text-xs text-muted-foreground uppercase tracking-widest">OR</span>
                <div className="h-px bg-border flex-1" />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-white flex items-center gap-1.5 justify-between">
                    <span>Prompt</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs">We will write the javascript for you.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </Label>
                <div className="relative">
                    <Textarea
                        placeholder="Describe your function in simple words..."
                        value={agent.prompt || ''}
                        onChange={(e) => handlePromptChange(e.target.value)}
                        className="min-h-[60px] bg-card border-border resize-none text-xs pr-10"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                simulateGenerateCode('function');
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => simulateGenerateCode('function')}
                        disabled={isGenerating || !agent.prompt}
                        className="absolute right-1 bottom-1 h-6 w-6 text-primary hover:text-primary hover:bg-primary/20"
                    >
                        {isGenerating ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Wand2 className="w-3 h-3" />}
                    </Button>
                </div>
            </div>
        </>
    );

    const renderReplyConfig = () => (
        <>
            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Reply Message Content</Label>
                <Textarea
                    placeholder="Enter the template or message to reply with directly..."
                    value={agent.inputMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="min-h-[150px] bg-card border-border resize-y text-sm"
                />
            </div>
        </>
    );

    const renderHttpConfig = () => (
        <>
            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">HTTP Method</Label>
                <Select value={agent.model || 'GET'} onValueChange={handleModelChange}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium text-white">URL</Label>
                <Input
                    placeholder="https://api.example.com/v1/data"
                    value={agent.inputMessage}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="font-mono text-xs bg-card border-border text-card-foreground"
                />
            </div>
        </>
    );

    const renderFlowConfig = () => (
        <>
            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Select Sub-Flow</Label>
                <Select value={agent.model} onValueChange={handleModelChange}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Choose a flow..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="flow-1">Customer Onboarding</SelectItem>
                        <SelectItem value="flow-2">Support Escalation</SelectItem>
                        <SelectItem value="flow-3">Generate Report</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    );

    const renderStartConfig = () => (
        <>
            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Trigger Protocol</Label>
                <Select value={agent.model || 'Manual'} onValueChange={handleModelChange}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Webhook">Webhook</SelectItem>
                        <SelectItem value="Schedule">Schedule / CRON</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {(agent.model === 'Webhook' || agent.model === 'Schedule') && (
                <div className="space-y-2 mt-4">
                    <Label className="text-sm font-medium text-white">
                        {agent.model === 'Webhook' ? 'Webhook Endpoint' : 'CRON Expression'}
                    </Label>
                    <Input
                        placeholder={agent.model === 'Webhook' ? "/api/webhook/xyz-123" : "0 0 * * *"}
                        value={agent.inputMessage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        className="font-mono text-xs bg-card border-border text-card-foreground"
                    />
                </div>
            )}
        </>
    );

    const renderNodeSpecificDetails = () => {
        switch (nodeType) {
            case 'condition': return renderConditionConfig();
            case 'function': return renderFunctionConfig();
            case 'reply': return renderReplyConfig();
            case 'http': return renderHttpConfig();
            case 'flow': return renderFlowConfig();
            case 'start': return renderStartConfig();
            case 'agent':
            default: return renderAgentSpecific();
        }
    };

    return (
        <div id="tutorial-config-panel" className="w-[380px] h-full border-l flex flex-col animate-fade-in-up bg-black/40 backdrop-blur-xl shadow-xl z-10 border-border">
            <div className="flex-1 overflow-y-auto">
                <div className="p-5 space-y-6">
                    {/* Header */}
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
                                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors bg-card text-muted-foreground"
                                >
                                    <Pencil className="w-3 h-3" />
                                </button>
                            </>
                        )}
                    </div>

                    <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary/20 text-primary border border-primary/30">
                        {nodeType} Node
                    </div>

                    {renderNodeSpecificDetails()}
                </div>
            </div>
        </div>
    );
}
