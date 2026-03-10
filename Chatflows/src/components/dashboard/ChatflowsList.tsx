'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Workflow, Plus, Trash2, Pencil, Download, X, ExternalLink, Chrome, FolderDown, Puzzle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function DownloadExtensionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                            <Puzzle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Download CrewAgent Extension</h2>
                            <p className="text-xs text-muted-foreground">Chrome Browser Extension</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Download Button */}
                    <a
                        href="https://github.com/vxwshxl/CrewSpace/tree/main/CrewAgent"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
                    >
                        <FolderDown className="w-5 h-5" />
                        Download CrewAgent from GitHub
                        <ExternalLink className="w-4 h-4 opacity-70" />
                    </a>

                    <p className="text-xs text-muted-foreground text-center">
                        Download or clone the <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-400">CrewAgent</code> folder from the repository
                    </p>

                    {/* Divider */}
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Installation Steps</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Steps */}
                    <div className="space-y-3">
                        {[
                            {
                                step: 1,
                                icon: <FolderDown className="w-4 h-4" />,
                                title: 'Download the folder',
                                desc: (
                                    <>
                                        Go to the GitHub link above, click <strong className="text-white">Code → Download ZIP</strong>, or clone the repo and locate the <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-400 text-xs">CrewAgent</code> folder.
                                    </>
                                ),
                            },
                            {
                                step: 2,
                                icon: <Chrome className="w-4 h-4" />,
                                title: 'Open Chrome Extensions',
                                desc: (
                                    <>
                                        Navigate to{' '}
                                        <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-400 text-xs">chrome://extensions</code>{' '}
                                        in your browser and enable <strong className="text-white">Developer mode</strong> (toggle in the top-right).
                                    </>
                                ),
                            },
                            {
                                step: 3,
                                icon: <Puzzle className="w-4 h-4" />,
                                title: 'Load the extension',
                                desc: (
                                    <>
                                        Click <strong className="text-white">Load unpacked</strong> and select the <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-400 text-xs">CrewAgent</code> folder you downloaded.
                                    </>
                                ),
                            },
                            {
                                step: 4,
                                icon: <CheckCircle2 className="w-4 h-4" />,
                                title: 'Pin & Use',
                                desc: (
                                    <>
                                        Pin the CrewAgent extension from the puzzle icon in Chrome&apos;s toolbar. Click it on any page to open the sidebar and start using your agents!
                                    </>
                                ),
                            },
                        ].map((item) => (
                            <div key={item.step} className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm font-bold">
                                    {item.step}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-emerald-400">{item.icon}</span>
                                        <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer note */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3">
                        <p className="text-xs text-emerald-300/80 leading-relaxed">
                            <strong>💡 Tip:</strong> Make sure your CrewSpace dashboard is running (locally or deployed) so the extension can connect to your configured chatflows and API keys.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ChatflowsList() {
    const { chatflows, deleteChatflow, addChatflow, updateChatflow } = useStore();
    const router = useRouter();
    const [showExtensionModal, setShowExtensionModal] = React.useState(false);

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
                    <Workflow className="w-6 h-6" /> Chatflows
                </h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowExtensionModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
                    >
                        <Download className="w-4 h-4" /> Download Extension
                    </button>
                    <button
                        id="tutorial-create-new-btn"
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                </div>
            </div>

            {chatflows.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-accent text-muted-foreground flex items-center justify-center mx-auto mb-4">
                        <Workflow className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Chatflows Yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Create your first agentic workflow combining multiple AI agents, conditions, and custom functions.
                    </p>
                    <button
                        id="tutorial-create-new-btn-empty"
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mx-auto"
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

            <DownloadExtensionModal
                open={showExtensionModal}
                onClose={() => setShowExtensionModal(false)}
            />
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
                <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 h-full flex flex-col">
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
                    className="p-1.5 text-muted-foreground hover:text-primary bg-card/80 backdrop-blur rounded-lg"
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
                    className="p-1.5 text-muted-foreground hover:text-destructive bg-card/80 backdrop-blur rounded-lg"
                    title="Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
