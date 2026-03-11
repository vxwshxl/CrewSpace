'use client';

import React from 'react';
import { BookOpen, PlayCircle, MousePointer2, ExternalLink, Bot, Workflow, Layers, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TutorialsList() {
    const router = useRouter();

    const handleStartTutorial = () => {
        localStorage.setItem('tutorial_force_start', 'true');
        router.push('/dashboard');
    };
    return (
        <div className="p-8 space-y-12 pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary" /> Tutorials
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Master the art of building autonomous AI agent workforces.
                    </p>
                </div>
                <button
                    onClick={handleStartTutorial}
                    className="flex items-center gap-2 bg-primary text-primary-foreground h-11 px-5 rounded-full text-sm font-semibold hover:bg-[#A6E63F] transition-all shadow-sm whitespace-nowrap"
                >
                    <Sparkles className="w-4 h-4" /> Start Interactive Tutorial
                </button>
            </div>

            {/* Quick Start Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group bg-card border border-border rounded-none p-6 hover:border-border/80 transition-all shadow-sm hover:shadow-md">
                    <div className="w-12 h-12 rounded-none bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform pb-0 border border-primary/20">
                        <PlayCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Introduction</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Learn the core concepts of CrewSpace and how autonomous agents work together to solve complex tasks.
                    </p>
                </div>
                <div className="group bg-card border border-border rounded-none p-6 hover:border-border/80 transition-all shadow-sm hover:shadow-md">
                    <div className="w-12 h-12 rounded-none bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform pb-0 border border-blue-500/20">
                        <Workflow className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">First Workflow</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Step-by-step guide to creating your very first multi-agent chatflow from scrap to deployment.
                    </p>
                </div>
                <div className="group bg-card border border-border rounded-none p-6 hover:border-border/80 transition-all shadow-sm hover:shadow-md">
                    <div className="w-12 h-12 rounded-none bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform pb-0 border border-green-500/20">
                        <ExternalLink className="w-6 h-6 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Using Extension</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        How to trigger your AI agents directly from any website using our specialized browser extension.
                    </p>
                </div>
            </div>

            {/* Detailed Guides */}
            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white border-b border-border pb-4">Detailed Core Guides</h2>
                
                <div className="space-y-6">
                    {/* The Dashboard */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="md:w-1/3 aspect-video bg-muted border border-border rounded-none overflow-hidden relative flex items-center justify-center">
                             <img src="/logoCS.png" className="w-16 opacity-20" alt="" />
                             <span className="absolute bottom-3 right-3 text-[10px] font-mono opacity-50 uppercase tracking-widest text-white">The Dashboard</span>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-primary" /> 1. Navigating the Dashboard
                            </h3>
                            <ul className="space-y-3 text-muted-foreground list-disc pl-5">
                                <li><strong>Chatflows:</strong> This is where your projects live. You can rename, delete, or quickly jump back into editing them.</li>
                                <li><strong>API Keys:</strong> Securely manage your Gemini, Groq, or Sarvam keys. These are stored locally in your browser for privacy.</li>
                                {/* <li><strong>Global Styles:</strong> Your platform aesthetics are persistent. Customizing once reflects everywhere.</li> */}
                            </ul>
                        </div>
                    </div>

                    {/* The Canvas */}
                    <div className="flex flex-col md:flex-row-reverse gap-8 items-start">
                        <div className="md:w-1/3 aspect-video bg-muted border border-border rounded-none overflow-hidden relative flex items-center justify-center">
                             <img src="/logoCS.png" className="w-16 opacity-20" alt="" />
                             <span className="absolute bottom-3 right-3 text-[10px] font-mono opacity-50 uppercase tracking-widest text-white">The Canvas</span>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <MousePointer2 className="w-5 h-5 text-primary" /> 2. Mastering the Canvas
                            </h3>
                            <ul className="space-y-3 text-muted-foreground list-disc pl-5">
                                <li><strong>Drag & Drop:</strong> Use the "Add Nodes" panel on the left to drag Agents, Conditions, and Sticky Notes onto the workspace.</li>
                                <li><strong>Connecting:</strong> Drag from the colored output handle of one node to the input handle of another to create logic flow.</li>
                                <li><strong>Configuring:</strong> Click any node to open the side panel where you can define roles, models, and personality.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Integration */}
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="md:w-1/3 aspect-video bg-muted border border-border rounded-none overflow-hidden relative flex items-center justify-center">
                             <img src="/logoCS.png" className="w-16 opacity-20" alt="" />
                             <span className="absolute bottom-3 right-3 text-[10px] font-mono opacity-50 uppercase tracking-widest text-white">Integration</span>
                        </div>
                        <div className="flex-1 space-y-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Bot className="w-5 h-5 text-primary" /> 3. Chrome Extension Integration
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Once your flow is saved, open the CrewSpace extension on any webpage. Select your chatflow from the list, and your AI crew will start executing within the context of the page you're currently viewing. Perfect for research, coding help, or content creation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
