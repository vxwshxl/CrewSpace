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
  const [selectedNodeType, setSelectedNodeType] = useState<string>('agent');
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
      if (node.type === 'sticky' || nodeData.originalType === 'sticky') return;
      
      if (nodeData.agentConfig) {
        setSelectedAgent(nodeData.agentConfig as AgentConfig);
        setSelectedNodeType((nodeData.originalType as string) || 'agent');
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
    (event: React.DragEvent, nodeType: string, label: string, icon: string) => {
      event.dataTransfer.setData('application/reactflow-type', nodeType);
      event.dataTransfer.setData('application/reactflow-label', label);
      event.dataTransfer.setData('application/reactflow-icon', icon || 'bot');
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
      const originalType = event.dataTransfer.getData('application/reactflow-type');
      const label = event.dataTransfer.getData('application/reactflow-label');
      const icon = event.dataTransfer.getData('application/reactflow-icon');

      if (!originalType) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      const newId = `node-${Date.now()}`;
      
      // Map originalType to internal ReactFlow nodeTypes
      // AgentCanvas supports: start, agent, condition, sticky
      let nodeType = 'agent';
      if (['start', 'sticky', 'condition'].includes(originalType)) {
        nodeType = originalType;
      }

      const isCondition = nodeType === 'condition';
      const nodeModelMap: Record<string, { model: string; icon: string }> = {
        agent: { model: 'gemini-flash-latest', icon: 'gemini' },
        condition: { model: 'gemini-flash-latest', icon: 'gemini' },
        http: { model: 'GET', icon: 'globe' },
        flow: { model: 'flow-1', icon: 'workflow' },
        start: { model: 'Manual', icon: 'play' },
      };
      const modelInfo = nodeModelMap[originalType] || nodeModelMap.agent;

      const newAgent: AgentConfig = {
        id: newId,
        name: label || (isCondition ? 'New Condition' : 'New Node'),
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
        type: nodeType,
        position,
        data: {
          label: newAgent.name,
          nodeType: nodeType,
          originalType: originalType,
          icon: icon,
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

  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
      return (
          <div className="flex flex-col items-center justify-center h-screen w-screen bg-background text-foreground p-8 text-center" style={{fontFamily: 'Host Grotesk, sans-serif'}}>
              <div className="w-16 h-16 bg-muted/20 border border-border rounded-2xl flex items-center justify-center mb-6 text-muted-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Desktop Recommended</h1>
              <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  The Agent Orchestrator canvas environment is built for larger displays. Please switch to a desktop or laptop to build workflows.
              </p>
          </div>
      );
  }

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
          onDragStart={onDragStart}
          setEdges={setEdges}
        />

        {/* Right panel - Config or Chat */}
        {showConfig && selectedAgent && (
          <ConfigPanel
            agent={selectedAgent}
            nodeType={selectedNodeType}
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
