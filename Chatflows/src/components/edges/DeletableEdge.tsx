'use client';

import React, { useState } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';

export default function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const { setEdges, screenToFlowPosition } = useReactFlow();
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent<SVGPathElement, MouseEvent>) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  const onMouseMove = (evt: React.MouseEvent<SVGPathElement, MouseEvent>) => {
    const pos = screenToFlowPosition({ x: evt.clientX, y: evt.clientY });
    setHoverPos(pos);
  };

  const onMouseLeave = () => {
    setHoverPos(null);
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ ...style, pointerEvents: 'none' }} />
      <path
        id={`interaction-${id}`}
        className="react-flow__edge-interaction"
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={30}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onEdgeClick}
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
      />
      <EdgeLabelRenderer>
        {hoverPos && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${hoverPos.x}px,${hoverPos.y}px)`,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <div className="w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center shadow-lg border-2 border-background scale-110">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
}
