'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { Trash2, Plus, Key } from 'lucide-react';

export default function ApiKeysList() {
    const { apiKeys, addApiKey, deleteApiKey } = useStore();
    const [isAdding, setIsAdding] = React.useState(false);
    const [newProvider, setNewProvider] = React.useState('sarvam');
    const [newName, setNewName] = React.useState('');
    const [newKey, setNewKey] = React.useState('');



    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addApiKey({
            provider: newProvider,
            name: newName,
            key: newKey,
        });
        setIsAdding(false);
        setNewName('');
        setNewKey('');
    };



    return (
        <div className="p-8 max-w-4xl mx-auto">

            {/* API Keys section */}
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Key className="w-6 h-6" /> API Keys
                </h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Key
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-card border border-border rounded-none p-6 mb-8 flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-white mb-2">Add New API Key</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Provider</label>
                            <select
                                className="w-full bg-background border border-border rounded-none px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                value={newProvider}
                                onChange={(e) => setNewProvider(e.target.value)}
                            >
                                <option value="sarvam">Sarvam</option>
                                <option value="gemini">Google Gemini</option>
                                <option value="groq">Groq</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Key Name (e.g. My Workspace)</label>
                            <input
                                required
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-background border border-border rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                                placeholder="My Production Key"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">API Key</label>
                        <input
                            required
                            type="password"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            className="w-full bg-background border border-border rounded-none px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
                            placeholder="sk-..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:bg-accent transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-full text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                            Save Key
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-card border border-border rounded-none overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted text-muted-foreground border-b border-border">
                        <tr>
                            <th className="px-6 py-3 font-medium">Provider</th>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Added On</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {apiKeys.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                    No API keys added yet. Securely store your model provider keys here.
                                </td>
                            </tr>
                        ) : (
                            apiKeys.map((k) => (
                                <tr key={k.id} className="hover:bg-accent/30 transition-colors group">
                                    <td className="px-6 py-4 capitalize text-white flex items-center gap-2">
                                        <div className="w-6 h-6 rounded bg-black/40 flex items-center justify-center text-[10px] border border-border">
                                            {k.provider === 'sarvam' ? 'S' : k.provider === 'groq' ? 'Q' : 'G'}
                                        </div>
                                        {k.provider}
                                    </td>
                                    <td className="px-6 py-4 text-white font-medium">{k.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{new Date(k.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteApiKey(k.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
