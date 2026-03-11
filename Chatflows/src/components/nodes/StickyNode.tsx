'use client';

import React, { memo } from 'react';
import { NodeProps, useReactFlow } from '@xyflow/react';
import { Trash2 } from 'lucide-react';

function StickyNode({ data, selected, id }: NodeProps) {
    const { setNodes } = useReactFlow();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNodes((nds) => nds.filter((n) => n.id !== id));
    };

    return (
        <div
            className={`relative w-[260px] min-h-[120px] rounded-xl border p-4 transition-all duration-300 group ${selected
                ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500'
                : 'border-yellow-600/30 hover:border-yellow-500/50'
                }`}
            style={{ background: 'oklch(0.16 0 0)' }}
        >
            {/* Delete button — visible on hover or select */}
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                title="Delete note"
            >
                <Trash2 className="w-3.5 h-3.5" />
            </button>

            <textarea
                className="w-full h-full min-h-[80px] bg-transparent resize-none outline-none text-muted-foreground placeholder:text-muted-foreground/30 text-sm font-medium pr-5"
                placeholder="Type something here"
                defaultValue={(data?.label as string) || ''}
            />
        </div>
    );
}

export default memo(StickyNode);
