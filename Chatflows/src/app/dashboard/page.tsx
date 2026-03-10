'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import ChatflowsList from '@/components/dashboard/ChatflowsList';
import ApiKeysList from '@/components/dashboard/ApiKeysList';
import { Workflow, Key, BookOpen } from 'lucide-react';
import TutorialsList from '@/components/dashboard/TutorialsList';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'chatflows' | 'apikeys' | 'tutorials'>('chatflows');

    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        return (
            <div className="flex flex-col items-center justify-center h-screen w-screen bg-background text-foreground p-8 text-center" style={{fontFamily: 'Host Grotesk, sans-serif'}}>
                <div className="w-16 h-16 bg-muted/20 border border-border rounded-2xl flex items-center justify-center mb-6 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Desktop Recommended</h1>
                <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    The Agent Orchestrator canvas environment is optimized for larger displays. Please switch to a desktop or laptop to build workflows.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 overflow-y-auto">
                <header className="h-14 border-b border-border bg-card/50 flex items-center px-6 sticky top-0 z-10 backdrop-blur">
                    <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {activeTab === 'chatflows' ? (
                            <><Workflow className="w-4 h-4" /> Chatflows</>
                        ) : activeTab === 'apikeys' ? (
                            <><Key className="w-4 h-4" /> API Keys</>
                        ) : (
                            <><BookOpen className="w-4 h-4" /> Tutorials</>
                        )}
                    </h2>
                </header>

                <div className="min-h-[calc(100vh-3.5rem)]">
                    {activeTab === 'chatflows' && <ChatflowsList />}
                    {activeTab === 'apikeys' && <ApiKeysList />}
                    {activeTab === 'tutorials' && <TutorialsList />}
                </div>
            </main>
        </div>
    );
}
