'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Paperclip,
    ChevronDown,
    ChevronUp,
    Play,
    Route,
    Bot,
    X,
    Sparkles,
    Clock,
    Brain,
    ListTodo,
    Star,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChatMessage,
    ProcessFlowStep,
    ActivityEntry,
    MemoryItem,
} from '@/lib/types';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    processFlow: ProcessFlowStep[];
    activityLog: ActivityEntry[];
    memoryItems: MemoryItem[];
    onSendMessage?: (message: string) => void;
    isLoading?: boolean;
    streamingText?: string;
    error?: string | null;
}

type TabType = 'chat' | 'activity' | 'memory';

const processFlowIcons: Record<string, React.ReactNode> = {
    play: <Play className="w-3 h-3" fill="currentColor" />,
    route: <Route className="w-3 h-3" />,
    bot: <Bot className="w-3 h-3" />,
};

export default function ChatPanel({
    isOpen,
    onClose,
    messages,
    processFlow,
    activityLog,
    memoryItems,
    onSendMessage,
    isLoading = false,
    streamingText,
    error,
}: ChatPanelProps) {
    const [input, setInput] = useState('');
    const [processFlowOpen, setProcessFlowOpen] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('chat');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, streamingText, isLoading]);

    if (!isOpen) return null;

    const handleSend = () => {
        if (input.trim() && onSendMessage) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'chat', label: 'Chat', icon: <Bot className="w-3.5 h-3.5" /> },
        { id: 'activity', label: 'Activity', icon: <Sparkles className="w-3.5 h-3.5" /> },
        { id: 'memory', label: 'Memory', icon: <Brain className="w-3.5 h-3.5" /> },
    ];

    return (
        <div
            className="w-[400px] h-full border-l flex flex-col animate-fade-in-up bg-black/40 backdrop-blur-xl shadow-xl"
            style={{
                borderColor: 'var(--border)',
            }}
        >
            {/* Tab bar */}
            <div className="flex items-center justify-between border-b px-2" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                            {activeTab === tab.id && (
                                <div
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[2px] rounded-full"
                                    style={{ background: 'var(--primary)' }}
                                />
                            )}
                        </button>
                    ))}
                </div>
                <button
                    onClick={onClose}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Content area */}
            <ScrollArea className="flex-1">
                {activeTab === 'chat' && (
                    <div className="p-4 space-y-4">
                        {/* Empty state */}
                        {messages.length === 0 && !isLoading && !error && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: 'var(--muted)' }}>
                                    <Bot className="w-6 h-6" style={{ color: 'var(--primary)' }} />
                                </div>
                                <p className="text-sm font-medium text-white mb-1">Start a conversation</p>
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                    Type a message below to chat with your Flowise agent
                                </p>
                            </div>
                        )}

                        {/* Chat messages */}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`animate-fade-in-up ${msg.role === 'user' ? 'flex justify-end' : ''
                                    }`}
                            >
                                {msg.role === 'assistant' ? (
                                    <div className="flex gap-2">
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                                            style={{ background: 'var(--muted)' }}
                                        >
                                            <Bot className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                        </div>
                                        <div
                                            className="rounded-xl px-3.5 py-2.5 max-w-[280px]"
                                            style={{
                                                background: 'var(--card)',
                                                color: 'var(--card-foreground)',
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                ) : msg.role === 'system' ? (
                                    <div className="flex justify-center">
                                        <div
                                            className="rounded-lg px-3 py-1.5 flex items-center gap-1.5"
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                            }}
                                        >
                                            <AlertCircle className="w-3 h-3 text-red-400" />
                                            <p className="text-[11px] text-red-400">{msg.content}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1.5">
                                        <div
                                            className="rounded-xl px-3.5 py-2.5 max-w-[280px]"
                                            style={{
                                                background: 'var(--card)',
                                                color: 'var(--foreground)',
                                            }}
                                        >
                                            <p className="text-xs leading-relaxed">{msg.content}</p>
                                        </div>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="flex justify-end">
                                                {msg.attachments.map((att, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="secondary"
                                                        className="text-[10px] gap-1"
                                                        style={{
                                                            background: 'var(--card)',
                                                            color: 'var(--muted-foreground)',
                                                        }}
                                                    >
                                                        <Paperclip className="w-2.5 h-2.5" />
                                                        {att}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Streaming text */}
                        {streamingText && (
                            <div className="flex gap-2 animate-fade-in-up">
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                                    style={{ background: 'var(--muted)' }}
                                >
                                    <Bot className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                </div>
                                <div
                                    className="rounded-xl px-3.5 py-2.5 max-w-[280px]"
                                    style={{
                                        background: 'var(--card)',
                                        color: 'var(--card-foreground)',
                                    }}
                                >
                                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{streamingText}</p>
                                </div>
                            </div>
                        )}

                        {/* Loading indicator */}
                        {isLoading && !streamingText && (
                            <div className="flex gap-2 animate-fade-in-up">
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1"
                                    style={{ background: 'var(--muted)' }}
                                >
                                    <Bot className="w-4 h-4" style={{ color: 'var(--primary)' }} />
                                </div>
                                <div
                                    className="rounded-xl px-3.5 py-2.5"
                                    style={{
                                        background: 'var(--card)',
                                        color: 'var(--muted-foreground)',
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--primary)' }} />
                                        <span className="text-xs">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="flex justify-center animate-fade-in-up">
                                <div
                                    className="rounded-lg px-3 py-2 flex items-start gap-2 max-w-[320px]"
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                    }}
                                >
                                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-[11px] text-red-400 leading-relaxed">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Process Flow */}
                        {processFlow.length > 0 && (
                            <div
                                className="rounded-xl border"
                                style={{
                                    background: 'var(--card)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                <button
                                    onClick={() => setProcessFlowOpen(!processFlowOpen)}
                                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium text-white"
                                >
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
                                        Process Flow
                                    </div>
                                    {processFlowOpen ? (
                                        <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                                    ) : (
                                        <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                                    )}
                                </button>
                                {processFlowOpen && (
                                    <div className="px-3 pb-3 space-y-1.5">
                                        {processFlow.map((step) => (
                                            <div key={step.id} className="flex items-center gap-2 py-1">
                                                <div
                                                    className="w-5 h-5 rounded flex items-center justify-center"
                                                    style={{
                                                        color:
                                                            step.status === 'completed'
                                                                ? 'var(--secondary)'
                                                                : step.status === 'running'
                                                                    ? 'var(--primary)'
                                                                    : 'oklch(0.45 0 0)',
                                                    }}
                                                >
                                                    {processFlowIcons[step.icon] || <Bot className="w-3 h-3" />}
                                                </div>
                                                <span
                                                    className="text-xs font-medium"
                                                    style={{ color: 'var(--muted-foreground)' }}
                                                >
                                                    {step.name}
                                                </span>
                                                <div className="flex-1" />
                                                {step.status === 'completed' && (
                                                    <div className="flex items-center gap-1">
                                                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
                                                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                                                                <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                                {step.status === 'running' && (
                                                    <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="p-4 space-y-2">
                        <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Real-time Activity Log</h3>
                        {activityLog.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Sparkles className="w-6 h-6 mb-2" style={{ color: 'var(--muted-foreground)' }} />
                                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Activity will appear here when you chat</p>
                            </div>
                        ) : (
                            activityLog.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="rounded-lg px-3 py-2.5 animate-fade-in-up"
                                    style={{
                                        background: 'var(--card)',
                                        borderLeft: `3px solid ${entry.type === 'thinking'
                                            ? 'var(--primary)'
                                            : entry.type === 'action'
                                                ? 'var(--secondary)'
                                                : entry.type === 'tool_use'
                                                    ? 'var(--muted-foreground)'
                                                    : entry.type === 'error'
                                                        ? 'oklch(0.65 0.2 25)'
                                                        : 'var(--secondary)'
                                            }`,
                                    }}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-semibold" style={{
                                            color: entry.type === 'thinking'
                                                ? 'var(--primary)'
                                                : entry.type === 'action'
                                                    ? 'var(--secondary)'
                                                    : entry.type === 'tool_use'
                                                        ? 'var(--muted-foreground)'
                                                        : 'var(--secondary)',
                                        }}>
                                            {entry.agentName} · {entry.type.replace('_', ' ').toUpperCase()}
                                        </span>
                                        <span className="text-[9px]" style={{ color: 'var(--muted-foreground)' }}>
                                            {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                                        {entry.content}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'memory' && (
                    <div className="p-4 space-y-4">
                        {/* Context section */}
                        <div>
                            <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-2" style={{ color: 'var(--primary)' }}>
                                <Brain className="w-3.5 h-3.5" /> Current Context
                            </h3>
                            {memoryItems
                                .filter((m) => m.type === 'context')
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg px-3 py-2.5 mb-1.5"
                                        style={{ background: 'var(--card)' }}
                                    >
                                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            {item.content}
                                        </p>
                                    </div>
                                ))}
                            {memoryItems.filter((m) => m.type === 'context').length === 0 && (
                                <p className="text-xs py-2" style={{ color: 'var(--muted-foreground)' }}>No context items yet</p>
                            )}
                        </div>

                        {/* Past tasks */}
                        <div>
                            <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-2" style={{ color: 'var(--secondary)' }}>
                                <ListTodo className="w-3.5 h-3.5" /> Past Tasks
                            </h3>
                            {memoryItems
                                .filter((m) => m.type === 'task')
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg px-3 py-2.5 mb-1.5 flex items-start gap-2"
                                        style={{ background: 'var(--card)' }}
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--secondary)' }} />
                                        <div>
                                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                                {item.content}
                                            </p>
                                            <span className="text-[9px] flex items-center gap-1 mt-1" style={{ color: 'var(--muted-foreground)' }}>
                                                <Clock className="w-2.5 h-2.5" />
                                                {item.timestamp.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            {memoryItems.filter((m) => m.type === 'task').length === 0 && (
                                <p className="text-xs py-2" style={{ color: 'var(--muted-foreground)' }}>No tasks recorded yet</p>
                            )}
                        </div>

                        {/* Learned preferences */}
                        <div>
                            <h3 className="text-xs font-semibold flex items-center gap-1.5 mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                <Star className="w-3.5 h-3.5" /> Learned Preferences
                            </h3>
                            {memoryItems
                                .filter((m) => m.type === 'preference')
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg px-3 py-2.5 mb-1.5"
                                        style={{ background: 'var(--card)' }}
                                    >
                                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                                            {item.content}
                                        </p>
                                    </div>
                                ))}
                            {memoryItems.filter((m) => m.type === 'preference').length === 0 && (
                                <p className="text-xs py-2" style={{ color: 'var(--muted-foreground)' }}>No preferences learned yet</p>
                            )}
                        </div>
                    </div>
                )}
            </ScrollArea>

            {/* Input area */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-white/10">
                        <Paperclip className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
                    </Button>
                    <Input
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 border-none bg-transparent text-xs text-white placeholder:text-white/25 focus-visible:ring-0"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded-full transition-all"
                        style={{
                            background: input.trim() && !isLoading ? 'var(--primary)' : 'oklch(0.25 0 0)',
                            color: 'white',
                        }}
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : input.trim() ? (
                            <Send className="w-3.5 h-3.5" />
                        ) : (
                            <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--card)' }} />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
