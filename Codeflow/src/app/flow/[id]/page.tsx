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
import ChatPanel from '@/components/ChatPanel';
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

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState<string>('');
  const chatHistoryRef = useRef<{ role: string; content: string }[]>([]);

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

  const handleSendMessage = useCallback(
    async (message: string) => {
      // Find the first agent node to use its model, or just default to gemini if none
      const agentNode = nodes.find(n => n.type === 'agent') as Node | undefined;
      const agentConfig = agentNode?.data?.agentConfig as AgentConfig | undefined;

      const model = agentConfig?.model || 'gemini-flash-latest';

      // Determine provider from model name naively
      let provider = 'gemini';
      if (model.includes('gpt') || model.includes('o1')) provider = 'openai';
      if (model.includes('claude')) provider = 'anthropic';

      // Find API key
      const apiKeyObj = store.apiKeys.find(k => k.provider === provider);
      const apiKey = apiKeyObj?.key;

      if (!apiKey) {
        setChatError(`No API key found for provider '${provider}'. Go to API Keys page to add one.`);
        return;
      }

      // Add user message
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setChatError(null);
      setIsLoading(true);

      try {
        const chatMessages = [
          ...chatHistoryRef.current,
          { role: 'user', content: message }
        ];

        // Add system prompt if agent has personality/role
        if (agentConfig && agentConfig.role) {
          chatMessages.unshift({ role: 'system', content: `You are a ${agentConfig.role}. ${agentConfig.personality || ''}` });
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            model,
            apiKey,
            messages: chatMessages,
          })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to get response');
        }

        const responseText = data.text;

        // Add assistant message
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: responseText,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Update chat history for context
        chatHistoryRef.current.push(
          { role: 'user', content: message },
          { role: 'assistant', content: responseText }
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get response';
        setChatError(errorMessage);
      } finally {
        setIsLoading(false);
        setStreamingText('');
      }
    },
    [nodes, store.apiKeys]
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

        {chatPanelOpen && !showConfig && (
          <ChatPanel
            isOpen={chatPanelOpen}
            onClose={() => setChatPanelOpen(false)}
            messages={messages}
            processFlow={[]}
            activityLog={[]}
            memoryItems={[]}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            streamingText={streamingText || undefined}
            error={chatError}
          />
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ReactFlowProvider>
      <DashboardContent />
    </ReactFlowProvider>
  );
}
