'use client';

import React, { useEffect } from 'react';
import {
    ChevronLeft,
    Pencil,
    Code2,
    Save,
    Settings,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

interface HeaderBarProps {
    title: string;
    onTitleChange?: (newTitle: string) => void;
    onToggleChatPanel?: () => void;
    chatPanelOpen?: boolean;
}

export default function HeaderBar({
    title,
    onTitleChange,
    onToggleChatPanel,
    chatPanelOpen,
}: HeaderBarProps) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [editValue, setEditValue] = React.useState(title);

    React.useEffect(() => {
        setEditValue(title);
    }, [title]);

    const handleSaveTitle = () => {
        setIsEditing(false);
        if (editValue.trim() && editValue !== title && onTitleChange) {
            onTitleChange(editValue.trim());
        } else {
            setEditValue(title); // revert
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSaveTitle();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(title);
        }
    };

    return (
        <header
            className="h-14 flex items-center justify-between px-5 border-b z-50 relative bg-black/40 backdrop-blur-xl shadow-sm"
            style={{
                borderColor: 'var(--border)',
            }}
        >
            {/* Left section */}
            <div className="flex items-center gap-3">
                <Link href="/dashboard">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 rounded-full hover:bg-white/10"
                        style={{ color: 'var(--muted-foreground)' }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                </Link>

                <div className="flex items-center gap-2">
                    <Image src="/logoCS.png" alt="CrewSpace Logo" width={24} height={24} className="rounded" />
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={handleKeyDown}
                            className="text-sm font-semibold text-white ml-2 bg-transparent border-b border-primary outline-none px-1 w-40"
                        />
                    ) : (
                        <>
                            <h1 className="text-sm font-semibold text-white ml-2">{title}</h1>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-5 h-5 rounded hover:bg-white/10"
                                style={{ color: 'var(--muted-foreground)' }}
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil className="w-3 h-3" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-1.5">
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full hover:bg-white/10 p-0 overflow-hidden"
                    title="Open CrewAgent"
                    onClick={() => {
                        window.postMessage({ type: 'TOGGLE_CREWAGENT' }, '*');
                    }}
                >
                    <Image src="/logoCS.png" alt="CrewAgent" width={22} height={22} className="rounded" />
                </Button>

                {/* Chat toggle buttons omitted */}
            </div>
        </header>
    );
}
