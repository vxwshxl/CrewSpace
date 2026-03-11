'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Search, Bot, GitBranch, GitMerge, Code, MessageCircle, Workflow, Globe, StickyNote, Play, FileText, Mail, CheckSquare, Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { nodeCategories } from '@/lib/mock-data';

interface NodePanelProps {
    onDragStart: (event: React.DragEvent, nodeType: string, label: string, icon: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
    bot: <Bot className="w-4 h-4" />,
    'git-branch': <GitBranch className="w-4 h-4" />,
    'git-merge': <GitMerge className="w-4 h-4" />,
    code: <Code className="w-4 h-4" />,
    'message-circle': <MessageCircle className="w-4 h-4" />,
    workflow: <Workflow className="w-4 h-4" />,
    globe: <Globe className="w-4 h-4" />,
    play: <Play className="w-4 h-4" />,
    'sticky-note': <StickyNote className="w-4 h-4" />,
    search: <Search className="w-4 h-4" />,
    'file-text': <FileText className="w-4 h-4" />,
    mail: <Mail className="w-4 h-4" />,
    'check-square': <CheckSquare className="w-4 h-4" />,
    calculator: <Calculator className="w-4 h-4" />,
};

export default function NodePanel({ onDragStart }: NodePanelProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [isToolsOpen, setIsToolsOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filteredCategories = nodeCategories.map((cat) => ({
        ...cat,
        items: cat.items.filter(
            (item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter((cat) => cat.items.length > 0);

    const agentCategories = filteredCategories.filter(cat => cat.name !== 'Tools');
    const toolCategories = filteredCategories.filter(cat => cat.name === 'Tools');

    return (
        <div className="relative z-50 flex items-start gap-2 w-[280px]">
            <button
                id="tutorial-add-nodes-btn"
                onClick={() => {
                    setIsOpen(!isOpen);
                    setIsToolsOpen(false);
                }}
                className="flex-1 flex items-center justify-between px-3 py-2 bg-card border border-border shadow-lg text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                style={{ color: 'var(--foreground)' }}
            >
                Add Nodes
                {isOpen ? <ChevronUp className="w- h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />}
            </button>
            
            <button
                id="tutorial-add-tools-btn"
                onClick={() => {
                    setIsToolsOpen(!isToolsOpen);
                    setIsOpen(false);
                }}
                className="flex-1 flex items-center justify-between px-3 py-2 bg-card border border-border shadow-lg text-sm font-semibold text-white hover:bg-white/5 transition-colors"
                style={{ color: 'var(--foreground)' }}
            >
                Tools
                {isToolsOpen ? <ChevronUp className="w-4 h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />}
            </button>

            {(isOpen || isToolsOpen) && (
                <div
                    className="absolute top-full left-0 mt-2 w-full max-h-[60vh] flex flex-col animate-fade-in-up bg-black/60 backdrop-blur-xl shadow-2xl border overflow-hidden"
                    style={{
                        borderColor: 'var(--border)',
                    }}
                >
                    {/* Search */}
                    <div className="p-3 pb-2">
                        <div className="relative">
                            <Search
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                                style={{ color: 'var(--muted-foreground)' }}
                            />
                            <Input
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-8 text-xs border rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none caret-primary"
                                style={{
                                    background: 'var(--card)',
                                    borderColor: 'var(--border)',
                                    color: 'var(--card-foreground)',
                                }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:text-white"
                                    style={{ color: 'var(--muted-foreground)' }}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-2">
                        {(isOpen ? agentCategories : toolCategories).map((category) => (
                            <div key={category.name} className="mb-1">
                                <div
                                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold"
                                    style={{ color: 'var(--muted-foreground)' }}
                                >
                                    <span>{category.name}</span>
                                </div>

                                <div className="space-y-0.5 pb-2">
                                        {category.items.map((item) => (
                                            <div
                                                key={item.id}
                                                id={`tutorial-node-${item.type}`}
                                                className="flex items-center gap-3 px-3 py-2.5 mx-1 cursor-grab hover:bg-white/5 transition-all duration-200 active:scale-95 shadow-sm"
                                                draggable
                                                onDragStart={(e) => onDragStart(e, item.type, item.name, item.icon)}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        background:
                                                            item.type === 'tool' ? 'rgba(59, 130, 246, 0.15)'
                                                            : item.type === 'agent' ? 'rgba(140, 82, 255, 0.15)'
                                                            : item.type === 'condition' ? 'rgba(255, 102, 196, 0.15)'
                                                            : item.type === 'sticky' ? 'rgba(234, 179, 8, 0.15)'
                                                            : 'rgba(193, 255, 114, 0.15)',
                                                        color:
                                                            item.type === 'tool' ? '#3b82f6'
                                                            : item.type === 'agent' ? 'var(--chart-1)'
                                                            : item.type === 'condition' ? 'var(--chart-4)'
                                                            : item.type === 'sticky' ? '#eab308'
                                                            : 'var(--chart-2)',
                                                    }}
                                                >
                                                    {iconMap[item.icon] || <Bot className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[13px] font-medium text-white truncate">{item.name}</p>
                                                    <p className="text-[11px] leading-tight mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
