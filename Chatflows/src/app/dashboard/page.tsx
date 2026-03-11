'use client';

import React, { useState } from 'react';
import AnimatedLoader from '@/components/AnimatedLoader';
import Sidebar, { TabType } from '@/components/dashboard/Sidebar';
import ChatflowsList from '@/components/dashboard/ChatflowsList';
import ApiKeysList from '@/components/dashboard/ApiKeysList';
import { Workflow, Key, BookOpen, ShoppingCart, Settings } from 'lucide-react';
import TutorialsList from '@/components/dashboard/TutorialsList';
import MarketplaceList from '@/components/dashboard/MarketplaceList';
import SettingsList from '@/components/dashboard/SettingsList';
import SquadsList from '@/components/dashboard/SquadsList';
import Image from 'next/image';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>('chatflows');
    const [mounted, setMounted] = useState(false);
    const [showLoader, setShowLoader] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        setMounted(true);
        const timer = setTimeout(() => setShowLoader(false), 3000);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => {
             window.removeEventListener('resize', checkMobile);
             clearTimeout(timer);
        };
    }, []);

    return (
        <>
            {(!mounted || showLoader) && <AnimatedLoader type="dashboard" />}
            
            {mounted && (
                isMobile ? (
                    <div className="flex flex-col items-center justify-center h-screen w-screen bg-background text-foreground p-8 text-center" style={{fontFamily: 'Host Grotesk, sans-serif'}}>
                        <div className="w-16 h-16 bg-muted/20 border border-border rounded-2xl flex items-center justify-center mb-6 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Desktop Recommended</h1>
                        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            The Agent Orchestrator canvas environment is optimized for larger displays. Please switch to a desktop or laptop to build workflows.
                        </p>
                    </div>
                ) : (
                    <div className="flex h-screen w-screen overflow-hidden bg-background">
                        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

                        <main className="flex-1 overflow-y-auto">
                            <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur w-full">
                                {/* Left side empty or reserved for potential title/breadcrumbs */}
                                <div></div>

                                {/* Right side - User Profile */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold text-white">Guest Captain</span>
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10 flex items-center justify-center text-muted-foreground">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                    </div>
                                </div>
                            </header>

                            <div className="min-h-[calc(100vh-3.5rem)]">
                                {activeTab === 'chatflows' && <ChatflowsList />}
                                {activeTab === 'apikeys' && <ApiKeysList />}
                                {activeTab === 'squads' && <SquadsList />}
                                {activeTab === 'marketplace' && <MarketplaceList />}
                                {activeTab === 'tutorials' && <TutorialsList />}
                                {activeTab === 'settings' && <SettingsList />}
                            </div>
                        </main>
                    </div>
                )
            )}
        </>
    );
}
