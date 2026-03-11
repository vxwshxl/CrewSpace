'use client';

import React, { useState } from 'react';
import { Pencil, Info, ChevronDown, Check, Wand2, Plus, Trash2 } from 'lucide-react';
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
        const newTools = agent.tools?.includes(toolId)
            ? agent.tools.filter((t) => t !== toolId)
            : [...(agent.tools || []), toolId];
        onUpdate({ ...agent, tools: newTools });
    };

    const handleToolConfigChange = (key: string, value: any) => {
        const currentConfig = agent.toolConfig || {};
        onUpdate({ ...agent, toolConfig: { ...currentConfig, [key]: value } });
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

    const renderMemoryConfig = () => (
        <>
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
        </>
    );

    const handleMessageArrayChange = (index: number, field: 'role' | 'content', value: string) => {
        const currentMessages = agent.messages || [];
        const newArr = [...currentMessages];
        newArr[index] = { ...newArr[index], [field]: value };
        onUpdate({ ...agent, messages: newArr });
    };

    const addMessageItem = () => {
        const currentMessages = agent.messages || [];
        onUpdate({ ...agent, messages: [...currentMessages, { role: 'system', content: '' }] });
    };

    const removeMessageItem = (index: number) => {
        const currentMessages = agent.messages || [];
        const newArr = [...currentMessages];
        newArr.splice(index, 1);
        onUpdate({ ...agent, messages: newArr });
    };

    const renderModelConfig = () => (
        <>
            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Chat Model <span className="text-red-400">*</span></Label>
                <Select value={agent.model} onValueChange={handleModelChange}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Select a model..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="gemini-flash-latest">gemini-flash-latest</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium text-white pb-2 block border-b border-border">Messages</Label>
                <div className="space-y-4 pt-2">
                    {agent.messages?.map((msg, i) => (
                        <div key={i} className="flex flex-col gap-2 p-3 bg-white/5 border border-border rounded-lg relative">
                             <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive" 
                                onClick={() => removeMessageItem(i)}
                             >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                            <div className="space-y-1 w-full">
                                <Label className="text-xs text-muted-foreground">Role <span className="text-red-400">*</span></Label>
                                <Select value={msg.role} onValueChange={(val) => handleMessageArrayChange(i, 'role', val || '')}>
                                    <SelectTrigger className="h-8 text-xs bg-card border-border">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="system">System</SelectItem>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="assistant">Assistant</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1 w-full">
                                <Label className="text-xs text-muted-foreground">Content <span className="text-red-400">*</span></Label>
                                <Textarea 
                                   placeholder="Message content..." 
                                   value={msg.content} 
                                   onChange={(e) => handleMessageArrayChange(i, 'content', e.target.value)} 
                                   className="min-h-[60px] text-xs bg-card border-border" 
                                />
                            </div>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full h-8" onClick={addMessageItem}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Message
                    </Button>
                </div>
            </div>
        </>
    );

    const renderToolConfig = () => {
        const tConfig = agent.toolConfig || {};
        
        if (agent.name.toLowerCase().includes('email drafter')) {
            return (
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">Pre-filled Email</Label>
                        <Input 
                            placeholder="recipient@example.com" 
                            value={tConfig.prefilledEmail || ''} 
                            onChange={(e) => handleToolConfigChange('prefilledEmail', e.target.value)}
                            className="text-xs bg-card border-border"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">Template Content</Label>
                        <Textarea 
                            placeholder="Hi [Name],\n\nThank you for..." 
                            value={tConfig.templateContent || ''} 
                            onChange={(e) => handleToolConfigChange('templateContent', e.target.value)}
                            className="min-h-[100px] text-xs bg-card border-border resize-y"
                        />
                    </div>
                </div>
            );
        }

        if (agent.name.toLowerCase().includes('summarizer')) {
             return (
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">Summary Tone</Label>
                         <Input 
                            placeholder="Professional, Casual, or Enthusiastic" 
                            value={tConfig.tone || ''} 
                            onChange={(e) => handleToolConfigChange('tone', e.target.value)}
                            className="text-xs bg-card border-border"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">Summary Type</Label>
                         <Input 
                            placeholder="Bullet points, Paragraph, Executive Brief" 
                            value={tConfig.type || ''} 
                            onChange={(e) => handleToolConfigChange('type', e.target.value)}
                            className="text-xs bg-card border-border"
                        />
                    </div>
                </div>
            );
        }

        if (agent.name.toLowerCase().includes('to-do')) {
             return (
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">Default List Name</Label>
                         <Input 
                            placeholder="My Tasks" 
                            value={tConfig.defaultList || ''} 
                            onChange={(e) => handleToolConfigChange('defaultList', e.target.value)}
                            className="text-xs bg-card border-border"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-white">Initial Tasks (Comma Separated)</Label>
                        <Textarea 
                            placeholder="Review PRs, Update Docs, Sync with Team" 
                            value={tConfig.initialTasks || ''} 
                            onChange={(e) => handleToolConfigChange('initialTasks', e.target.value)}
                            className="min-h-[80px] text-xs bg-card border-border resize-y"
                        />
                    </div>
                </div>
            );
        }

        return (
             <div className="space-y-2">
                <p className="text-xs text-muted-foreground">This tool connects seamlessly to your agent flow.</p>
            </div>
        );
    };

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

    const handleHttpChange = (field: keyof NonNullable<AgentConfig['httpConfig']>, value: any) => {
        const currentHttp = agent.httpConfig || {
            method: agent.model || 'GET',
            url: agent.inputMessage || '',
            headers: [],
            queryParams: [],
            bodyType: 'none',
            responseType: 'json'
        };
        onUpdate({ ...agent, httpConfig: { ...currentHttp, [field]: value } });
    };

    const handleHttpArrayChange = (field: 'headers' | 'queryParams', index: number, keyStr: string, valStr: string) => {
        const currentHttp = agent.httpConfig || {
            method: agent.model || 'GET', url: agent.inputMessage || '',
            headers: [], queryParams: [], bodyType: 'none', responseType: 'json'
        };
        const newArr = [...currentHttp[field]];
        newArr[index] = { key: keyStr, value: valStr };
        handleHttpChange(field, newArr);
    };

    const addHttpArrayItem = (field: 'headers' | 'queryParams') => {
        const currentHttp = agent.httpConfig || {
            method: agent.model || 'GET', url: agent.inputMessage || '',
            headers: [], queryParams: [], bodyType: 'none', responseType: 'json'
        };
        handleHttpChange(field, [...currentHttp[field], { key: '', value: '' }]);
    };

    const removeHttpArrayItem = (field: 'headers' | 'queryParams', index: number) => {
        const currentHttp = agent.httpConfig || {
            method: agent.model || 'GET', url: agent.inputMessage || '',
            headers: [], queryParams: [], bodyType: 'none', responseType: 'json'
        };
        const newArr = [...currentHttp[field]];
        newArr.splice(index, 1);
        handleHttpChange(field, newArr);
    };

    const renderHttpConfig = () => {
        const httpConf = agent.httpConfig || {
            method: agent.model || 'GET',
            url: agent.inputMessage || '',
            headers: [],
            queryParams: [],
            bodyType: 'none',
            responseType: 'json'
        };

        return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">HTTP Credential</Label>
                <Select value={httpConf.credentialId || 'none'} onValueChange={(v) => handleHttpChange('credentialId', v === 'none' ? undefined : v)}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Select Credential" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="api-key">API Key</SelectItem>
                        <SelectItem value="bearer">Bearer Token</SelectItem>
                        <SelectItem value="basic">Basic Auth</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-1">
                    <Label className="text-sm font-medium text-white">Method</Label>
                    <span className="text-red-400 text-sm">*</span>
                </div>
                <Select value={httpConf.method} onValueChange={(v) => handleHttpChange('method', v)}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-1 justify-between">
                    <div className="flex items-center gap-1">
                        <Label className="text-sm font-medium text-white">URL</Label>
                        <span className="text-red-400 text-sm">*</span>
                    </div>
                    <span className="text-xs text-muted-foreground mr-1 cursor-pointer hover:text-primary transition-colors">(x)</span>
                </div>
                <Input
                    placeholder="https://api.example.com/v1/data"
                    value={httpConf.url}
                    onChange={(e) => handleHttpChange('url', e.target.value)}
                    className="font-mono text-xs bg-card border-border text-card-foreground"
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Headers</Label>
                <div className="space-y-2">
                    {httpConf.headers.map((h, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input placeholder="Key" value={h.key} onChange={(e) => handleHttpArrayChange('headers', i, e.target.value, h.value)} className="bg-card border-border text-xs w-1/3" />
                            <Input placeholder="Value" value={h.value} onChange={(e) => handleHttpArrayChange('headers', i, h.key, e.target.value)} className="bg-card border-border text-xs flex-1" />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeHttpArrayItem('headers', i)}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full h-8" onClick={() => addHttpArrayItem('headers')}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Headers
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Query Params</Label>
                <div className="space-y-2">
                    {httpConf.queryParams.map((q, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Input placeholder="Key" value={q.key} onChange={(e) => handleHttpArrayChange('queryParams', i, e.target.value, q.value)} className="bg-card border-border text-xs w-1/3" />
                            <Input placeholder="Value" value={q.value} onChange={(e) => handleHttpArrayChange('queryParams', i, q.key, e.target.value)} className="bg-card border-border text-xs flex-1" />
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeHttpArrayItem('queryParams', i)}>
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-full h-8" onClick={() => addHttpArrayItem('queryParams')}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Query Params
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Body Type</Label>
                <Select value={httpConf.bodyType} onValueChange={(v) => handleHttpChange('bodyType', v)}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Body Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="form-data">Form Data</SelectItem>
                        <SelectItem value="raw">Raw</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {httpConf.bodyType !== 'none' && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium text-white">Body</Label>
                    <Textarea
                        placeholder="Request body content..."
                        value={httpConf.body || ''}
                        onChange={(e) => handleHttpChange('body', e.target.value)}
                        className="font-mono text-xs min-h-[100px] bg-card border-border resize-y"
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label className="text-sm font-medium text-white">Response Type</Label>
                <Select value={httpConf.responseType} onValueChange={(v) => handleHttpChange('responseType', v)}>
                    <SelectTrigger className="w-full h-10 border rounded-lg bg-card border-border text-card-foreground">
                        <SelectValue placeholder="Response Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="text">Text / String</SelectItem>
                        <SelectItem value="blob">Blob / File</SelectItem>
                        <SelectItem value="arraybuffer">ArrayBuffer</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        );
    };

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
            case 'tool': return renderToolConfig();
            case 'model': return renderModelConfig();
            case 'memory': return renderMemoryConfig();
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
