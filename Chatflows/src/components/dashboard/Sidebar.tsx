'use client';

import React from 'react';
import Link from 'next/link';
import { Workflow, Key, BookOpen, ShoppingCart, Settings, Users } from 'lucide-react';

export type TabType = 'chatflows' | 'apikeys' | 'squads' | 'marketplace' | 'tutorials' | 'settings';

interface SidebarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <div className="w-64 h-full border-r bg-black/40 border-[var(--border)] flex flex-col">
            <Link href="/" className="h-14 flex items-center px-4 border-b border-[var(--border)] gap-2 hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-6 h-6 rounded bg-black flex items-center justify-center">
                    <img src="/logoCS.png" alt="Logo" className="w-full h-full rounded" />
                </div>
                <span className="font-semibold text-white tracking-wide text-sm">CrewSpace</span>
            </Link>

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

                <button
                    onClick={() => onTabChange('squads')}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'squads'
                        ? 'bg-primary/90 text-primary-foreground'
                        : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Squads
                </button>

                <div className="pt-4 mt-4 border-t border-border/50 space-y-1">
                    <button
                        onClick={() => onTabChange('marketplace')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'marketplace'
                            ? 'bg-primary/90 text-primary-foreground'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Marketplace
                    </button>
                    
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

                    <button
                        onClick={() => onTabChange('settings')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'settings'
                            ? 'bg-primary/90 text-primary-foreground'
                            : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        Profile Settings
                    </button>
                </div>
            </nav>
        </div>
    );
}
