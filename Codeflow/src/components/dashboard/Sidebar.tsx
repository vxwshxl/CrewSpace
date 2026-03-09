'use client';

import React from 'react';
import { Share2, Store, Key } from 'lucide-react';

interface SidebarProps {
    activeTab: 'chatflows' | 'apikeys';
    onTabChange: (tab: 'chatflows' | 'apikeys') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <div className="w-64 h-full border-r bg-black/40 border-[var(--border)] flex flex-col">
            <div className="h-14 flex items-center px-4 border-b border-[var(--border)] gap-2">
                <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                    <img src="/logoCS.png" alt="Logo" className="w-full h-full rounded" />
                </div>
                <span className="font-semibold text-white tracking-wide">CrewSpaceAI</span>
            </div>

            <nav className="flex-1 py-4 px-2 space-y-1">
                <button
                    onClick={() => onTabChange('chatflows')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'chatflows'
                        ? 'bg-[var(--primary)]/90 text-[var(--primary-foreground)]'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                >
                    <Share2 className="w-4 h-4" />
                    Chatflows
                </button>

                <button
                    onClick={() => onTabChange('apikeys')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'apikeys'
                        ? 'bg-[var(--primary)]/90 text-[var(--primary-foreground)]'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                        }`}
                >
                    <Key className="w-4 h-4" />
                    API Keys
                </button>
            </nav>
        </div>
    );
}
