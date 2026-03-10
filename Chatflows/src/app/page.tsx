'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import ChatflowsList from '@/components/dashboard/ChatflowsList';
import ApiKeysList from '@/components/dashboard/ApiKeysList';
import { Workflow, Key } from 'lucide-react';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'chatflows' | 'apikeys'>('chatflows');

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="flex-1 overflow-y-auto">
                <header className="h-14 border-b border-border bg-card/50 flex items-center px-6 sticky top-0 z-10 backdrop-blur">
                    <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {activeTab === 'chatflows' ? (
                            <><Workflow className="w-4 h-4" /> Chatflows</>
                        ) : (
                            <><Key className="w-4 h-4" /> API Keys</>
                        )}
                    </h2>
                </header>

                <div className="min-h-[calc(100vh-3.5rem)]">
                    {activeTab === 'chatflows' && <ChatflowsList />}
                    {activeTab === 'apikeys' && <ApiKeysList />}
                </div>
            </main>
        </div>
    );
}
