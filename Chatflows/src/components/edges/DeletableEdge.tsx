'use client';

import React from 'react';
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
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <path
        id={`interaction-${id}`}
        className="react-flow__edge-interaction peer"
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} className="peer" />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 1000,
          }}
          className="nodrag nopan opacity-0 hover:opacity-100 peer-hover:opacity-100 transition-opacity"
        >
          <button
            className="w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full text-white flex items-center justify-center cursor-pointer shadow-xl border-2 border-background transform transition-transform hover:scale-110"
            onClick={onEdgeClick}
            aria-label="Delete Edge"
          >
            <svg
              width="18"
              height="18"
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
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
