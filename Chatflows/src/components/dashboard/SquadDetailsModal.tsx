'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Workflow as WorkflowIcon, Calendar, Crown, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import gsap from 'gsap';
import Link from 'next/link';

interface SquadDetailsModalProps {
    isOpen: boolean;
    squadId: string | null;
    onClose: () => void;
}

export default function SquadDetailsModal({ isOpen, squadId, onClose }: SquadDetailsModalProps) {
    const [squad, setSquad] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [chatflows, setChatflows] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'workflows' | 'members'>('workflows');
    const supabase = createClient();
    
    const modalRef = React.useRef<HTMLDivElement>(null);
    const overlayRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && squadId) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current, { y: 20, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' });
            
            fetchSquadDetails();
        } else {
            setSquad(null);
            setMembers([]);
            setChatflows([]);
        }
    }, [isOpen, squadId]);

    const fetchSquadDetails = async () => {
        setLoading(true);
        if (!squadId) return;

        // Fetch Squad Info
        const { data: squadData } = await supabase.from('squads').select('*').eq('id', squadId).single();
        if (squadData) setSquad(squadData);

        // Fetch Members using secure RPC to get names/emails
        const { data: membersData } = await supabase.rpc('get_squad_members_details', { p_squad_id: squadId });
        if (membersData) setMembers(membersData);

        // Fetch Chatflows
        const { data: chatflowsData } = await supabase
            .from('squad_chatflows')
            .select(`
                chatflow_id,
                added_at,
                chatflows (*)
            `)
            .eq('squad_id', squadId);
            
        if (chatflowsData) {
            setChatflows(chatflowsData.map((d: any) => d.chatflows).filter(Boolean));
        }

        setLoading(false);
    };

    const handleClose = () => {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
        gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.2, onComplete: onClose });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div ref={overlayRef} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
            <div ref={modalRef} className="relative w-full max-w-3xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-muted-foreground text-sm">Loading squad details...</p>
                    </div>
                ) : squad ? (
                    <>
                        <div className="px-8 py-6 border-b border-border/50 flex items-start justify-between bg-card shrink-0">
                            <div>
                                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-primary/30 bg-primary/10 flex items-center justify-center">
                                        <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    {squad.name}
                                </h2>
                                {squad.description && (
                                    <p className="text-sm text-muted-foreground mt-3 max-w-xl leading-relaxed">{squad.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-white/5 border border-white/10 rounded-full text-white flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Created {new Date(squad.created_at).toLocaleDateString()}
                                    </span>
                                    {squad.is_public ? (
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full">
                                            Public Squad
                                        </span>
                                    ) : (
                                        <span className="text-xs font-semibold px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full">
                                            Private Squad
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={handleClose} className="p-2 text-muted-foreground hover:text-white hover:bg-white/5 rounded-full transition-colors flex-shrink-0">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex border-b border-border/50 px-8 pt-4 bg-card/50 shrink-0">
                            <button 
                                onClick={() => setTab('workflows')}
                                className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${tab === 'workflows' ? 'border-primary text-white' : 'border-transparent text-muted-foreground hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <WorkflowIcon className="w-4 h-4" />
                                    Workflows ({chatflows.length})
                                </div>
                            </button>
                            <button 
                                onClick={() => setTab('members')}
                                className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${tab === 'members' ? 'border-primary text-white' : 'border-transparent text-muted-foreground hover:text-white'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Captains ({members.length})
                                </div>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 bg-background">
                            {tab === 'workflows' && (
                                <div className="space-y-4">
                                    {chatflows.length === 0 ? (
                                        <div className="text-center py-12 border border-dashed border-border rounded-xl">
                                            <WorkflowIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                                            <p className="text-white font-medium">No workflows found</p>
                                            <p className="text-sm text-muted-foreground mt-1">This squad doesn't have any shared workflows yet.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {chatflows.map(cf => (
                                                <Link href={`/flow/${cf.id}`} key={cf.id} className="group p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all flex flex-col h-full">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h4 className="font-bold text-white group-hover:text-primary transition-colors">{cf.name}</h4>
                                                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-white/5">
                                                        <span>{cf.data?.nodes?.length || 0} Nodes</span>
                                                        <span>Updated {new Date(cf.updated_at).toLocaleDateString()}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {tab === 'members' && (
                                <div className="space-y-3">
                                    {members.map(member => (
                                        <div key={member.user_id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white flex items-center gap-2">
                                                        {member.user_name || 'Crew Captain'}
                                                        {member.user_id === squad.owner_id && <Crown className="w-3.5 h-3.5 text-yellow-500" />}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate max-w-[200px] md:max-w-none">
                                                        {member.user_id === squad.owner_id ? 'Squad Creator' : 'Crew Captain'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 bg-white/5 rounded-md text-muted-foreground">
                                                {member.role === 'owner' || member.user_id === squad.owner_id ? 'OWNER' : 'MEMBER'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-red-400">Failed to load squad details.</div>
                )}
            </div>
        </div>
    );
}
