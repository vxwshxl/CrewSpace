'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Workflow, Plus, Trash2, Pencil, Download, X, Chrome, FolderDown, Puzzle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import DownloadExtensionBtn from '@/components/DownloadExtensionBtn';

export default function ChatflowsList() {
    const { chatflows, deleteChatflow, addChatflow, updateChatflow } = useStore();
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
        <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Workflow className="w-8 h-8 text-primary" />
                        Chatflows
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage and build your personal AI agents and workflows.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <DownloadExtensionBtn />
                    <button
                        id="tutorial-create-new-btn"
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>
            </div>

            {chatflows.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-none py-20 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent text-muted-foreground flex items-center justify-center mx-auto mb-4 opacity-50">
                        <Workflow className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Chatflows Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create your first agentic workflow combining multiple AI agents, conditions, and custom functions.
                    </p>
                    <button
                        id="tutorial-create-new-btn-empty"
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-bold hover:bg-primary/90 transition-colors mx-auto"
                    >
                        <Plus className="w-4 h-4" /> Create Chatflow
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {chatflows.map((flow) => (
                        <ChatflowCard
                            key={flow.id}
                            flow={flow}
                            onDelete={deleteChatflow}
                            onUpdate={updateChatflow}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ChatflowCard({ flow, onDelete, onUpdate }: { flow: any; onDelete: (id: string) => void; onUpdate: (id: string, data: any) => void }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(flow.name);

    const handleSave = () => {
        setIsEditing(false);
        if (editValue.trim() && editValue !== flow.name) {
            onUpdate(flow.id, { name: editValue.trim() });
        } else {
            setEditValue(flow.name);
        }
    };

    return (
        <div className="group relative">
            <Link href={`/flow/${flow.id}`}>
                <div className="bg-card border border-border rounded-none p-6 hover:border-border/80 transition-all shadow-sm hover:shadow-md h-full flex flex-col">
                    <div className="flex-1">
                        {isEditing ? (
                            <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleSave}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                    if (e.key === 'Escape') {
                                        setIsEditing(false);
                                        setEditValue(flow.name);
                                    }
                                }}
                                onClick={(e) => e.preventDefault()}
                                className="text-lg font-semibold text-white mb-2 bg-transparent border-b border-primary outline-none w-full"
                            />
                        ) : (
                            <div className="flex items-center gap-2 mb-2 group-hover:text-primary transition-colors">
                                <h3 className="text-lg font-semibold text-white">{flow.name}</h3>
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                            {flow.nodes.length} Nodes • {flow.edges.length} Connections
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <span>Updated {new Date(flow.updatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </Link>
            <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-primary bg-card/80 backdrop-blur rounded-full"
                    title="Rename"
                >
                    <Pencil className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(flow.id);
                    }}
                    className="p-1.5 text-muted-foreground hover:text-destructive bg-card/80 backdrop-blur rounded-full"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
