'use client';

import React from 'react';
import { Handle, useEdges } from '@xyflow/react';
import type { HandleProps } from '@xyflow/react';

interface ConnectedHandleProps extends HandleProps {
    nodeId: string;
    fillColor: string;
}

export default function ConnectedHandle({
    nodeId,
    fillColor,
    style,
    className,
    ...props
}: ConnectedHandleProps) {
    const edges = useEdges();

    const isConnected = edges.some(e =>
        props.type === 'source'
            ? e.source === nodeId && (!props.id || e.sourceHandle === props.id)
            : e.target === nodeId && (!props.id || e.targetHandle === props.id)
    );

    return (
        <Handle
            {...props}
            className={className}
            style={{
                ...style,
                background: isConnected ? fillColor : 'oklch(0.10 0 0)',
                border: `2px solid ${fillColor}`,
                transition: 'background 0.25s ease',
            }}
        />
    );
}
