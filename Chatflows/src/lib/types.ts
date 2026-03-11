export interface Tool {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
}

export interface HttpKeyValue {
    key: string;
    value: string;
}

export interface HttpNodeConfig {
    credentialId?: string;
    method: string;
    url: string;
    headers: HttpKeyValue[];
    queryParams: HttpKeyValue[];
    bodyType: string;
    body?: string;
    responseType: string;
}

export interface AgentConfig {
    id: string;
    name: string;
    role: string;
    personality: string;
    model: string;
    modelIcon: string;
    tools: string[];
    memoryEnabled: boolean;
    memoryType: string;
    messages: string[];
    knowledgeSources: string[];
    inputMessage: string;
    responseFormat: string;
    prompt?: string;
    httpConfig?: HttpNodeConfig;
}

export interface ActivityEntry {
    id: string;
    agentId: string;
    agentName: string;
    type: 'thinking' | 'action' | 'output' | 'error' | 'tool_use';
    content: string;
    timestamp: Date;
    status: 'running' | 'completed' | 'error';
}

export interface MemoryItem {
    id: string;
    agentId: string;
    type: 'context' | 'task' | 'preference';
    content: string;
    timestamp: Date;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    attachments?: string[];
}

export interface ProcessFlowStep {
    id: string;
    name: string;
    icon: string;
    status: 'completed' | 'running' | 'pending' | 'error';
    children?: ProcessFlowStep[];
}

export interface NodeData {
    label: string;
    agentConfig?: AgentConfig;
    nodeType: 'start' | 'agent' | 'condition';
    status?: 'idle' | 'running' | 'completed' | 'error';
}

export interface NodeCategory {
    name: string;
    items: NodeCategoryItem[];
}

export interface NodeCategoryItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'agent' | 'condition' | 'function' | 'reply' | 'flow' | 'http' | 'start' | 'sticky' | 'tool' | 'model' | 'memory';
}
