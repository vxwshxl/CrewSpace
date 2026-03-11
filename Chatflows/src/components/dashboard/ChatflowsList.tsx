'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Workflow, Plus, Trash2, Pencil, Globe, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DownloadExtensionBtn from '@/components/DownloadExtensionBtn';
import { createClient } from '@/utils/supabase/client';
import PublishModal, { PublishDetails } from './marketplace/PublishModal';

export default function ChatflowsList() {
    const [chatflows, setChatflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [workflowToPublish, setWorkflowToPublish] = useState<any | null>(null);
    const [successToast, setSuccessToast] = useState<string | null>(null);
    
    const router = useRouter();
    const supabase = createClient();
    const { setChatflows: storeSetChatflows, deleteChatflow: storeDeleteChatflow } = useStore();

    useEffect(() => {
        fetchChatflows();
    }, []);

    const fetchChatflows = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('chatflows').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
        if (data) {
            setChatflows(data);
            // Sync with Zustand store for extension
            storeSetChatflows(data.map(f => ({
                id: f.id,
                name: f.name,
                nodes: f.data?.nodes || [],
                edges: f.data?.edges || [],
                createdAt: new Date(f.created_at).getTime(),
                updatedAt: new Date(f.updated_at).getTime()
            })));
        }
        setLoading(false);
    };

    const handleCreateNew = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase.from('chatflows').insert({
            user_id: user.id,
            name: 'New Chatflow',
            data: { nodes: [], edges: [] }
        }).select().single();

        if (data) {
            router.push(`/flow/${data.id}`);
        }
    };

    const handleDelete = async (id: string) => {
        await supabase.from('chatflows').delete().eq('id', id);
        storeDeleteChatflow(id);
        fetchChatflows();
    };

    const handleUpdate = async (id: string, name: string) => {
        await supabase.from('chatflows').update({ name, updated_at: new Date().toISOString() }).eq('id', id);
        fetchChatflows();
    };

    const handleConfirmPublish = async (details: PublishDetails) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const workflow = chatflows.find(f => f.id === details.id);
            if (!workflow) return;

            // Submit to marketplace_workflows table
            const { error } = await supabase.from('marketplace_workflows').insert({
                user_id: user.id,
                name: details.name,
                description: details.description,
                category: details.category,
                price: details.price,
                is_premium: details.isPremium,
                icon: details.icon,
                template_data: workflow.data,
                creator_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous'
            });

            if (error) throw error;

            setSuccessToast("Workflow published to Marketplace!");
            setWorkflowToPublish(null);
            
            setTimeout(() => setSuccessToast(null), 4000);
        } catch (err) {
            console.error("Publishing failed:", err);
            alert("Failed to publish workflow. Ensure the marketplace table exists.");
        }
    };

    return (
        <div className="p-8">
            {/* Success Toast */}
            {successToast && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-100 bg-emerald-500 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3 font-semibold text-sm animate-in slide-in-from-top-5 duration-300">
                    <CheckCircle2 className="w-4 h-4" />
                    {successToast}
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        <Workflow className="w-8 h-8 text-primary" />
                        Chatflows
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Manage and build your personal AI agents and workflows.</p>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <DownloadExtensionBtn />
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#D8D8D8] active:scale-95 transition-all shadow-sm whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="border border-dashed border-white/10 rounded-xl p-12 text-center">
                    <p className="text-muted-foreground">Loading chatflows...</p>
                </div>
            ) : chatflows.length === 0 ? (
                <div className="border border-dashed border-white/10 rounded-xl p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 text-muted-foreground flex items-center justify-center mx-auto mb-4 border border-white/5">
                        <Workflow className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No Chatflows Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                        Create your first agentic workflow combining multiple AI agents, conditions, and custom functions.
                    </p>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-bold hover:bg-[#A6E63F] active:scale-95 transition-all shadow-sm mx-auto"
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
                            onDelete={handleDelete}
                            onUpdate={(id, updateData) => handleUpdate(id, updateData.name!)}
                            onPublish={(f) => setWorkflowToPublish(f)}
                        />
                    ))}
                </div>
            )}

            <PublishModal 
                workflow={workflowToPublish}
                onClose={() => setWorkflowToPublish(null)}
                onConfirm={handleConfirmPublish}
            />
        </div>
    );
}

function ChatflowCard({ flow, onDelete, onUpdate, onPublish }: { 
    flow: any; 
    onDelete: (id: string) => void; 
    onUpdate: (id: string, data: any) => void;
    onPublish: (flow: any) => void;
}) {
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
            <Link href={`/flow/${flow.id}`} className="block h-full">
                <div className="bg-[#161b22] border border-white/5 rounded-xl p-6 hover:border-white/20 transition-all duration-200 shadow-sm hover:shadow-lg h-full flex flex-col cursor-pointer">
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
                                className="text-lg font-bold text-white mb-2 bg-transparent border-b border-primary outline-none w-full"
                            />
                        ) : (
                            <div className="flex items-center gap-2 mb-2 group-hover:text-primary transition-colors">
                                <h3 className="text-lg font-bold text-white tracking-tight">{flow.name}</h3>
                            </div>
                        )}
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                            {flow.data?.nodes?.length || 0} Nodes • {flow.data?.edges?.length || 0} Connections
                        </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-600 font-bold uppercase tracking-tight font-mono">
                        <span>Updated {new Date(flow.updated_at || flow.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </Link>
            <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onPublish(flow);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-emerald-400 bg-black/40 backdrop-blur border border-white/5 rounded-lg transition-colors shadow-xl"
                    title="Publish to Marketplace"
                >
                    <Globe className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(true);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-blue-400 bg-black/40 backdrop-blur border border-white/5 rounded-lg transition-colors shadow-xl"
                    title="Rename"
                >
                    <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(flow.id);
                    }}
                    className="p-1.5 text-zinc-500 hover:text-red-400 bg-black/40 backdrop-blur border border-white/5 rounded-lg transition-colors shadow-xl"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
