'use client';

import React, { useState, useCallback, useRef } from 'react';
import {
  type Node,
  type Edge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  addEdge,
} from '@xyflow/react';

import HeaderBar from '@/components/HeaderBar';
import NodePanel from '@/components/NodePanel';
import AgentCanvas from '@/components/AgentCanvas';
import ConfigPanel from '@/components/ConfigPanel';

import { AgentConfig, ChatMessage } from '@/lib/types';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function DashboardContent() {
  const params = useParams();
  const id = params.id as string;
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState<Edge>([]);
  const [flowName, setFlowName] = useState('New Chatflow');
  const [loading, setLoading] = useState(true);
  
  const [nodePanelOpen, setNodePanelOpen] = useState(true);
  const [chatPanelOpen, setChatPanelOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<string>('agent');
  const [showConfig, setShowConfig] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  // Load flow data from Supabase
  React.useEffect(() => {
    const loadFlow = async () => {
      const { data, error } = await supabase
        .from('chatflows')
        .select('*')
        .eq('id', id)
        .single();

      if (data && !error) {
        setFlowName(data.name);
        if (data.data) {
          setNodes(data.data.nodes || []);
          setEdges(data.data.edges || []);
        }
      }
      setLoading(false);
    };

    loadFlow();
  }, [id]);

  const debouncedNodes = useDebounce(nodes, 1000);
  const debouncedEdges = useDebounce(edges, 1000);

  // Auto-save effect
  React.useEffect(() => {
    if (loading) return;

    const saveFlow = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase.from('chatflows').upsert({
            id,
            user_id: user.id,
            name: flowName,
            data: { nodes: debouncedNodes, edges: debouncedEdges },
            updated_at: new Date().toISOString(),
        });
        
        // Notify extension to refresh
        window.postMessage({ type: 'SYNC_CREWAGENT' }, '*');
    };

    saveFlow();
  }, [debouncedNodes, debouncedEdges, flowName, id, loading]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeData = node.data as Record<string, unknown>;
      const _type = (nodeData.originalType as string) || node.type || 'agent';
      
      // Disable the config panel for these nodes
      if (['sticky', 'agent'].includes(_type)) {
        return;
      }
      
      if (nodeData.agentConfig) {
        setSelectedAgent(nodeData.agentConfig as AgentConfig);
        setSelectedNodeType(_type);
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
      setFlowName(newTitle);
    },
    []
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

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Offset by half of typical node size to center on cursor
      position.x -= 100;
      position.y -= 40;

      const newId = `node-${Date.now()}`;
      
      // AgentCanvas supports: start, agent, condition, sticky, tool
      let nodeType = 'agent';
      if (['start', 'sticky', 'condition', 'tool', 'model', 'memory'].includes(originalType)) {
        nodeType = originalType;
      }

      const isCondition = nodeType === 'condition';
      const isTool = nodeType === 'tool';
      const isModel = nodeType === 'model';
      const isMemory = nodeType === 'memory';
      const nodeModelMap: Record<string, { model: string; icon: string }> = {
        agent: { model: 'gemini-flash-latest', icon: 'gemini' },
        condition: { model: 'gemini-flash-latest', icon: 'gemini' },
        http: { model: 'GET', icon: 'globe' },
        flow: { model: 'flow-1', icon: 'workflow' },
        start: { model: 'Manual', icon: 'play' },
        tool: { model: 'Function', icon: icon || 'bot' },
        model: { model: 'gemini-flash-latest', icon: icon || 'bot' },
        memory: { model: 'Database', icon: icon || 'database' }
      };
      const modelInfo = nodeModelMap[originalType] || nodeModelMap.agent;

      const newAgent: AgentConfig = {
        id: newId,
        name: label || (isCondition ? 'New Condition' : isTool ? 'Tool' : isModel ? 'Model' : isMemory ? 'Memory' : 'New Node'),
        role: isTool ? 'Tool integration' : 'General Assistant',
        personality: isTool ? 'Execute functions seamlessly' : 'Helpful and adaptable',
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

      if (originalType === 'start') {
          setNodes((nds) => {
              const hasStart = nds.some(n => n.type === 'start' || (n.data && n.data.nodeType === 'start'));
              if (hasStart) {
                  setErrorToast('Only one Start node is allowed.');
                  setTimeout(() => setErrorToast(null), 3000);
                  return nds;
              }
              return [...nds, newNode];
          });
      } else {
          setNodes((nds) => [...nds, newNode]);
      }
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (params: Connection) => {
        setEdges((eds) => addEdge(params, eds));
        
        // Auto-enable memory on connect
        setNodes((nds) => nds.map(node => {
            if (node.id === params.source || node.id === params.target) {
                const nodeData = node.data as Record<string, any>;
                if (nodeData.nodeType === 'memory' && nodeData.agentConfig) {
                    return {
                        ...node,
                        data: {
                            ...nodeData,
                            agentConfig: {
                                ...nodeData.agentConfig as AgentConfig,
                                memoryEnabled: true
                            }
                        }
                    };
                }
            }
            return node;
        }));
    },
    [setEdges, setNodes]
  );

  const onEdgesChange = useCallback(
      (changes: any) => {
          onEdgesChangeBase(changes);

          // Need to wait slightly for state to settle to check remaining edges,
          // or we can calculate it manually based on the current edges minus the removed ones.
          const removedEdges = changes.filter((c: any) => c.type === 'remove');
          if (removedEdges.length > 0) {
              setTimeout(() => {
                  setNodes((nds) => {
                      let updated = false;
                      const newNodes = nds.map(node => {
                          const nodeData = node.data as Record<string, any>;
                          if (nodeData.nodeType === 'memory' && nodeData.agentConfig) {
                              setEdges((currentEdges) => {
                                  // Check if this memory node still has any connections
                                  const hasConnections = currentEdges.some(e => e.source === node.id || e.target === node.id);
                                  if (!hasConnections && (nodeData.agentConfig as AgentConfig).memoryEnabled) {
                                      updated = true;
                                      node.data = {
                                          ...nodeData,
                                          agentConfig: {
                                              ...nodeData.agentConfig as AgentConfig,
                                              memoryEnabled: false
                                          }
                                      };
                                  }
                                  return currentEdges;
                              });
                          }
                          return node;
                      });
                      return updated ? [...newNodes] : nds;
                  });
              }, 0);
          }
      },
      [onEdgesChangeBase, setNodes, setEdges]
  );

  const handleAIGenerate = useCallback((newNodes: Node[], newEdges: Edge[]) => {
      setNodes((nds) => {
          const hasStart = nds.some(n => n.type === 'start' || n.data?.nodeType === 'start');
          let nodesToAdd = newNodes;
          let generatedEdges = newEdges;

          if (hasStart) {
              const incomingStart = newNodes.find(n => n.type === 'start' || n.data?.nodeType === 'start');
              if (incomingStart) {
                  nodesToAdd = newNodes.filter(n => n.id !== incomingStart.id);
                  const existingStart = nds.find(n => n.type === 'start' || n.data?.nodeType === 'start')!;
                  generatedEdges = newEdges.map(e => ({
                      ...e,
                      source: e.source === incomingStart.id ? existingStart.id : e.source,
                      target: e.target === incomingStart.id ? existingStart.id : e.target
                  }));
              }
          }
          
          setEdges((eds) => [...eds, ...generatedEdges]);
          return [...nds, ...nodesToAdd];
      });
      setToastMessage('Workflow is done and we can start using in the extension.');
      setTimeout(() => setToastMessage(null), 5000);
  }, [setNodes, setEdges]);

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
        title={flowName}
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
          onAIGenerate={handleAIGenerate}
          onError={(msg) => {
            setErrorToast(msg);
            setTimeout(() => setErrorToast(null), 4000);
          }}
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

      {toastMessage && (
        <div className="absolute top-16 right-5 z-[60] bg-green-500/20 border border-green-500/50 backdrop-blur-md text-white px-4 py-3 rounded-lg shadow-xl animate-fade-in-up flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {errorToast && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[60] bg-red-500/90 border border-red-500 text-white px-4 py-3 rounded-lg shadow-xl animate-fade-in-up flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span className="text-sm font-medium pt-0.5">{errorToast}</span>
        </div>
      )}
    </div>
  );
}

import AnimatedLoader from '@/components/AnimatedLoader';

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  React.useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setShowLoader(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {(!mounted || showLoader) && <AnimatedLoader type="flow" />}
      
      {mounted && (
        <ReactFlowProvider>
          <DashboardContent />
        </ReactFlowProvider>
      )}
    </>
  );
}
