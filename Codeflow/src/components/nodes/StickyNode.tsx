'use client';

import React from 'react';
import { NodeProps } from '@xyflow/react';

export default function StickyNode({ data, selected }: NodeProps) {
    return (
        <div
            className={`w-[260px] min-h-[120px] rounded-xl border p-4 transition-all duration-300 group ${selected
                ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.15)] ring-1 ring-yellow-500'
                : 'border-yellow-600/30 hover:border-yellow-500/50'
                }`}
            style={{
                background: 'oklch(0.16 0 0)',
            }}
        >
            <textarea
                className="w-full h-full min-h-[80px] bg-transparent resize-none outline-none text-muted-foreground placeholder:text-muted-foreground/30 text-sm font-medium"
                placeholder="Type something here"
                defaultValue={(data?.label as string) || ''}
            />
        </div>
    );
}
