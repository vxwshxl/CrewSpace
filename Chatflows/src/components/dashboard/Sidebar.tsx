'use client';

import React from 'react';
import { Workflow, Key, BookOpen } from 'lucide-react';

interface SidebarProps {
    activeTab: 'chatflows' | 'apikeys' | 'tutorials';
    onTabChange: (tab: 'chatflows' | 'apikeys' | 'tutorials') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <div className="w-64 h-full border-r bg-black/40 border-[var(--border)] flex flex-col">
            <div className="h-14 flex items-center px-4 border-b border-[var(--border)] gap-2">
                <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                    <img src="/logoCS.png" alt="Logo" className="w-full h-full rounded" />
                </div>
                <span className="font-semibold text-white tracking-wide text-sm">CrewSpace</span>
            </div>

            <nav className="flex-1 py-4 px-2 space-y-1">
                <button
                    onClick={() => onTabChange('chatflows')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'chatflows'
                        ? 'bg-primary/90 text-primary-foreground'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Workflow className="w-4 h-4" />
                    Chatflows
                </button>

                <button
                    onClick={() => onTabChange('apikeys')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'apikeys'
                        ? 'bg-primary/90 text-primary-foreground'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Key className="w-4 h-4" />
                    API Keys
                </button>

                <div className="pt-4 mt-4 border-t border-border/50">
                    <button
                        onClick={() => onTabChange('tutorials')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'tutorials'
                            ? 'bg-primary/90 text-primary-foreground'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Tutorials
                    </button>
                </div>
            </nav>
        </div>
    );
}
