'use client';

import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Search, Bot, GitBranch, GitMerge, Code, MessageCircle, Workflow, Globe, StickyNote, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { nodeCategories } from '@/lib/mock-data';

interface NodePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onDragStart: (event: React.DragEvent, nodeType: string, label: string) => void;
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
};

export default function NodePanel({ isOpen, onClose, onDragStart }: NodePanelProps) {
    const [search, setSearch] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['Agent Flows']);

    const toggleCategory = (name: string) => {
        setExpandedCategories((prev) =>
            prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
        );
    };

    const filteredCategories = nodeCategories.map((cat) => ({
        ...cat,
        items: cat.items.filter(
            (item) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter((cat) => cat.items.length > 0);

    if (!isOpen) return null;

    return (
        <div
            className="w-[260px] h-full border-r flex flex-col animate-fade-in-up bg-black/40 backdrop-blur-xl shadow-xl"
            style={{
                borderColor: 'var(--border)',
            }}
        >
            {/* Header */}
            <div className="p-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Add Nodes</span>
                <button
                    onClick={onClose}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 pb-3">
                <div className="relative">
                    <Search
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                        style={{ color: 'var(--muted-foreground)' }}
                    />
                    <Input
                        placeholder="Search nodes"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-xs border rounded-lg"
                        style={{
                            background: 'var(--card)',
                            borderColor: 'var(--border)',
                            color: 'var(--card-foreground)',
                        }}
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2"
                            style={{ color: 'var(--muted-foreground)' }}
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <ScrollArea className="flex-1 px-1">
                {filteredCategories.map((category) => (
                    <div key={category.name} className="mb-1">
                        <button
                            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-white/5 rounded transition-colors"
                            style={{ color: 'var(--muted-foreground)' }}
                            onClick={() => toggleCategory(category.name)}
                        >
                            <span>{category.name}</span>
                            {expandedCategories.includes(category.name) ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>

                        {expandedCategories.includes(category.name) && (
                            <div className="space-y-0.5 pb-2">
                                {category.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start gap-3 px-3 py-2.5 mx-1 rounded-lg cursor-grab hover:bg-white/5 transition-all duration-200 active:scale-95"
                                        draggable
                                        onDragStart={(e) => onDragStart(e, item.type, item.name)}
                                    >
                                        <div
                                            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{
                                                background:
                                                    item.type === 'agent'
                                                        ? 'rgba(140, 82, 255, 0.25)'
                                                        : item.type === 'condition'
                                                            ? 'rgba(255, 102, 196, 0.25)'
                                                            : item.type === 'sticky'
                                                                ? 'rgba(234, 179, 8, 0.25)'
                                                                : 'rgba(193, 255, 114, 0.25)',
                                                color:
                                                    item.type === 'agent'
                                                        ? 'var(--primary)'
                                                        : item.type === 'condition'
                                                            ? 'var(--muted-foreground)'
                                                            : item.type === 'sticky'
                                                                ? '#eab308'
                                                                : 'var(--secondary)',
                                            }}
                                        >
                                            {iconMap[item.icon] || <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-white truncate">{item.name}</p>
                                            <p className="text-[10px] leading-tight mt-0.5 line-clamp-2" style={{ color: 'var(--muted-foreground)' }}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
}
