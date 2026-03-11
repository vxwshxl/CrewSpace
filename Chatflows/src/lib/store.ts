import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';

export interface Chatflow {
    id: string;
    name: string;
    createdAt: number;
    updatedAt: number;
    nodes: Node[];
    edges: Edge[];
}

export interface ApiKey {
    id: string;
    provider: string; // e.g., 'openai', 'anthropic', 'gemini'
    name: string;
    key: string;
    createdAt: number;
}

interface AppState {
    chatflows: Chatflow[];
    apiKeys: ApiKey[];

    // Actions
    addChatflow: (chatflow: Omit<Chatflow, 'createdAt' | 'updatedAt'>) => void;
    updateChatflow: (id: string, updates: Partial<Omit<Chatflow, 'id' | 'createdAt' | 'updatedAt'>>) => void;
    deleteChatflow: (id: string) => void;

    addApiKey: (apiKey: Omit<ApiKey, 'id' | 'createdAt'>) => void;
    deleteApiKey: (id: string) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            chatflows: [],
            apiKeys: [],

            addChatflow: (chatflow) => set((state) => {
                if (state.chatflows.some((f) => f.id === chatflow.id)) {
                    return state;
                }
                return {
                    chatflows: [
                        { ...chatflow, createdAt: Date.now(), updatedAt: Date.now() },
                        ...state.chatflows
                    ]
                };
            }),

            updateChatflow: (id, updates) => set((state) => ({
                chatflows: state.chatflows.map((flow) =>
                    flow.id === id
                        ? { ...flow, ...updates, updatedAt: Date.now() }
                        : flow
                )
            })),

            deleteChatflow: (id) => set((state) => ({
                chatflows: state.chatflows.filter((flow) => flow.id !== id)
            })),

            addApiKey: (apiKey) => set((state) => ({
                apiKeys: [
                    ...state.apiKeys,
                    {
                        ...apiKey,
                        id: crypto.randomUUID(),
                        createdAt: Date.now(),
                    }
                ]
            })),

            deleteApiKey: (id) => set((state) => ({
                apiKeys: state.apiKeys.filter((key) => key.id !== id)
            })),
        }),
        {
            name: 'crewspace-storage-v2',
            version: 1,
        }
    )
);


// Removed auto-sync to /api/sync/store as it was destructive and conflicted with direct DB persistence.

