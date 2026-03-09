'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Share2, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ChatflowsList() {
    const { chatflows, deleteChatflow, addChatflow } = useStore();
    const router = useRouter();

    const handleCreateNew = () => {
        const id = `flow-${Date.now()}`;
        addChatflow({
            id,
            name: 'New Chatflow',
            nodes: [],
            edges: [],
        });
        router.push(`/flow/${id}`);
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Share2 className="w-6 h-6" /> Chatflows
                </h1>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add New
                </button>
            </div>

            {chatflows.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent text-muted-foreground flex items-center justify-center mx-auto mb-4">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Chatflows Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create your first agentic workflow combining multiple AI agents, conditions, and custom functions.
                    </p>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mx-auto"
                    >
                        <Plus className="w-4 h-4" /> Create Chatflow
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {chatflows.map((flow) => (
                        <div key={flow.id} className="group relative">
                            <Link href={`/flow/${flow.id}`}>
                                <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors">{flow.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {flow.nodes.length} Nodes • {flow.edges.length} Connections
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Updated {new Date(flow.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </Link>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deleteChatflow(flow.id);
                                }}
                                className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-destructive bg-card/80 backdrop-blur rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
