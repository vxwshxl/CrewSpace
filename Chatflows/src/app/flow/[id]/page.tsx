'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from '@xyflow/react';

import HeaderBar from '@/components/HeaderBar';
import NodePanel from '@/components/NodePanel';
import AgentCanvas from '@/components/AgentCanvas';
import ConfigPanel from '@/components/ConfigPanel';

import { useStore } from '@/lib/store';
import { AgentConfig, ChatMessage } from '@/lib/types';
import { useParams } from 'next/navigation';

function DashboardContent() {
  const params = useParams();
  const id = params.id as string;
  const store = useStore();

  const currentFlow = store.chatflows.find((f) => f.id === id);

  const [nodes, setNodes, onNodesChange] = useNodesState(currentFlow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(currentFlow?.edges || []);
  const [nodePanelOpen, setNodePanelOpen] = useState(true);
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);



  // Auto-save effect
  React.useEffect(() => {
    if (currentFlow) {
      store.updateChatflow(id, { nodes, edges });
    } else {
      store.addChatflow({
        id,
        name: 'New Chatflow',
        nodes,
        edges,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, id]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeData = node.data as Record<string, unknown>;
      if (nodeData.agentConfig) {
        setSelectedAgent(nodeData.agentConfig as AgentConfig);
        setShowConfig(true);
        setChatPanelOpen(false);
      }
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setShowConfig(false);
    setChatPanelOpen(true);
  }, []);

  const handleTitleChange = useCallback(
    (newTitle: string) => {
      store.updateChatflow(id, { name: newTitle });
    },
    [id, store]
  );



  const handleAgentUpdate = useCallback(
    (updatedAgent: AgentConfig) => {
      setSelectedAgent(updatedAgent);
      setNodes((nds) =>
        nds.map((n) => {
          const nData = n.data as Record<string, unknown>;
          if (
            nData.agentConfig &&
            (nData.agentConfig as AgentConfig).id === updatedAgent.id
          ) {
            return {
              ...n,
              data: {
                ...n.data,
                label: updatedAgent.name,
                agentConfig: updatedAgent,
              },
            };
          }
          return n;
        })
      );
    },
    [setNodes]
  );

  const onDragStart = useCallback(
    (event: React.DragEvent, nodeType: string, label: string) => {
      event.dataTransfer.setData('application/reactflow-type', nodeType);
      event.dataTransfer.setData('application/reactflow-label', label);
      event.dataTransfer.effectAllowed = 'move';
    },
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow-type');
      const label = event.dataTransfer.getData('application/reactflow-label');

      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      const newId = `node-${Date.now()}`;
      const isCondition = type === 'condition';
      const nodeModelMap: Record<string, { model: string; icon: string }> = {
        agent: { model: 'gemini-flash-latest', icon: 'gemini' },
        condition: { model: 'gemini-flash-latest', icon: 'gemini' },
      };
      const modelInfo = nodeModelMap[type] || nodeModelMap.agent;

      const newAgent: AgentConfig = {
        id: newId,
        name: label || (isCondition ? 'New Condition' : 'New Agent'),
        role: 'General Assistant',
        personality: 'Helpful and adaptable',
        model: modelInfo.model,
        modelIcon: modelInfo.icon,
        tools: [],
        memoryEnabled: false,
        memoryType: 'All Messages',
        messages: [],
        knowledgeSources: [],
        inputMessage: '',
        responseFormat: 'Use Markdown',
      };

      const newNode: Node = {
        id: newId,
        type: isCondition ? 'condition' : 'agent',
        position,
        data: {
          label: newAgent.name,
          nodeType: isCondition ? 'condition' : 'agent',
          status: 'idle',
          agentConfig: newAgent,
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onConnect = useCallback(
    () => { },
    []
  );

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden" ref={reactFlowWrapper}>
      <HeaderBar
        title={currentFlow?.name || "Agentic Workflow"}
        onTitleChange={handleTitleChange}
        onToggleChatPanel={() => {
          setChatPanelOpen(!chatPanelOpen);
          if (!chatPanelOpen) setShowConfig(false);
        }}
        chatPanelOpen={chatPanelOpen || showConfig}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Add Nodes */}
        <NodePanel
          isOpen={nodePanelOpen}
          onClose={() => setNodePanelOpen(false)}
          onDragStart={onDragStart}
        />

        {/* Center canvas */}
        <AgentCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          setEdges={setEdges}
          onToggleNodePanel={() => setNodePanelOpen(!nodePanelOpen)}
          nodePanelOpen={nodePanelOpen}
        />

        {/* Right panel - Config or Chat */}
        {showConfig && selectedAgent && (
          <ConfigPanel
            agent={selectedAgent}
            onUpdate={handleAgentUpdate}
            onClose={() => {
              setShowConfig(false);
              setChatPanelOpen(true);
            }}
          />
        )}

        {/* Chat window logic removed since extension manages interaction */}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-black">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <DashboardContent />
    </ReactFlowProvider>
  );
}
