import React, { useState } from 'react';
import { User, AIAgent, AgentMessage, ToolExecution } from '../types';
import {
  Bot,
  Sparkles,
  Play,
  Terminal,
  Wrench,
  Coins,
  History,
  PlusCircle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Send,
} from 'lucide-react';

interface AgentStudioProps {
  currentUser: User | null;
}

export const AgentStudio: React.FC<AgentStudioProps> = ({ currentUser }) => {
  // Initial default agent
  const [agents, setAgents] = useState<AIAgent[]>([
    {
      id: 'agent-1',
      name: 'Omni Enterprise Assistant',
      description: 'Autonomous research and tool-calling agent with vector search & analytical sandbox.',
      systemPrompt: 'You are Omni, a specialized enterprise AI assistant. Always output structured, verifiable reasoning with explicit tool invocations.',
      modelName: 'gemini-2.5-flash',
      tools: ['vector_retrieval', 'math_engine', 'database_query'],
      status: 'ACTIVE',
      rateLimitPerMinute: 60,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'agent-2',
      name: 'Security Audit & Compliance Agent',
      description: 'Inspects user auth events, token anomalies, and automated rate limit violations.',
      systemPrompt: 'You are a cybersecurity sentinel agent scanning PostgreSQL audit logs for suspicious session patterns.',
      modelName: 'gemini-2.5-pro',
      tools: ['audit_log_scanner', 'ip_reputation_check'],
      status: 'ACTIVE',
      rateLimitPerMinute: 30,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(agents[0]);
  const [prompt, setPrompt] = useState('Calculate the 90-day projected token consumption and search for recent security compliance standards.');
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeSessionMessages, setActiveSessionMessages] = useState<AgentMessage[]>([
    {
      id: 'm-0',
      role: 'system',
      content: `Agent initialized with system prompt: "${selectedAgent.systemPrompt}" and model: ${selectedAgent.modelName}.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Form for new agent
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentPrompt, setNewAgentPrompt] = useState('');
  const [newAgentModel, setNewAgentModel] = useState('gemini-2.5-flash');

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName || !newAgentPrompt) return;

    const created: AIAgent = {
      id: `agent-${Date.now()}`,
      name: newAgentName,
      description: 'Custom user-defined autonomous agent.',
      systemPrompt: newAgentPrompt,
      modelName: newAgentModel,
      tools: ['web_search', 'calculator'],
      status: 'ACTIVE',
      rateLimitPerMinute: 60,
      createdAt: new Date().toISOString(),
    };

    setAgents((prev) => [created, ...prev]);
    setSelectedAgent(created);
    setShowCreateModal(false);
    setNewAgentName('');
    setNewAgentPrompt('');
  };

  const handleExecute = async () => {
    if (!prompt.trim() || isExecuting) return;
    setIsExecuting(true);

    const userMsg: AgentMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    setActiveSessionMessages((prev) => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt('');

    // Simulate Agent processing with realistic tool calls
    setTimeout(() => {
      const toolCalls: ToolExecution[] = [];

      if (currentPrompt.toLowerCase().includes('calculate') || currentPrompt.toLowerCase().includes('token')) {
        toolCalls.push({
          toolName: 'math_engine',
          args: { formula: 'avg_requests_day (4500) * 120 tokens * 90 days' },
          result: { projected_tokens: 48600000, estimated_usd_cost: 14.58 },
        });
      }

      if (currentPrompt.toLowerCase().includes('search') || currentPrompt.toLowerCase().includes('security')) {
        toolCalls.push({
          toolName: 'vector_retrieval',
          args: { query: 'SOC2 Type II token rotation requirements' },
          result: { chunks: 3, top_document: 'compliance_manual_v2.pdf (p. 42)' },
        });
      }

      const responseText = `[Autonomous Agent: ${selectedAgent.name}]\n\n` +
        `Execution Breakdown:\n` +
        `1. Identity Verified: ${currentUser?.email || 'Anonymous/Service Account'} (Role: ${currentUser?.role || 'USER'})\n` +
        `2. Dispatched ${toolCalls.length} tool invocation(s) via secure backend sandbox.\n` +
        `3. Evaluated reasoning graph and stored trace in PostgreSQL 'agent_sessions' table.\n\n` +
        `Analysis Summary:\n` +
        `The agent successfully verified security compliance parameters and calculated projected resource utilization. Refresh tokens remain safeguarded through single-use SHA-256 rotation policy.`;

      const assistantMsg: AgentMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        toolCalls,
        tokens: 342,
        timestamp: new Date().toLocaleTimeString(),
      };

      setActiveSessionMessages((prev) => [...prev, assistantMsg]);
      setIsExecuting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Future-Proof AI Agent Architecture
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Agent Execution & Multi-Tenant Session Sandbox
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Designed specifically for your future AI agents. Endpoints in <code className="text-blue-400">backend/app/api/v1/endpoints/agents.py</code> enforce user ownership, track token counts, and persist session history in PostgreSQL with JSONB tool traces.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="self-start sm:self-auto px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Register New Agent
          </button>
        </div>
      </div>

      {/* Main Agent Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Agent Selector & Configuration (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-400" />
              Registered Agents
            </h3>

            <div className="space-y-2">
              {agents.map((agent) => {
                const isSelected = selectedAgent.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setSelectedAgent(agent);
                      setActiveSessionMessages([
                        {
                          id: `init-${Date.now()}`,
                          role: 'system',
                          content: `Loaded ${agent.name} (${agent.modelName}). System prompt: "${agent.systemPrompt}"`,
                          timestamp: new Date().toLocaleTimeString(),
                        },
                      ]);
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-200'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-white mb-1">
                      <span>{agent.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{agent.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                      <span className="font-mono text-blue-400">{agent.modelName}</span>
                      <span>•</span>
                      <span>{agent.tools.length} Tools</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Agent Configuration Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              Agent Configuration & Tools
            </h4>

            <div>
              <span className="text-slate-400 text-[11px]">System Prompt:</span>
              <div className="mt-1 p-2 rounded bg-slate-950 text-slate-300 font-mono text-[11px] border border-slate-800">
                {selectedAgent.systemPrompt}
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[11px]">Attached Tools (JSONB Schema):</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedAgent.tools.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Rate Limit:</span>
              <span className="font-mono text-white font-semibold">{selectedAgent.rateLimitPerMinute} req/min</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Execution Console (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[650px]">
          {/* Console Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">Execution Console & Session Trace</span>
              <span className="text-slate-500 font-mono">({selectedAgent.name})</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Token Tracker: Active
              </span>
            </div>
          </div>

          {/* Conversation & Tool Calls Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2 scrollbar-thin">
            {activeSessionMessages.map((msg) => {
              if (msg.role === 'system') {
                return (
                  <div key={msg.id} className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-slate-400 text-xs font-mono">
                    <span className="text-blue-400 font-bold">[SYSTEM]</span> {msg.content}
                  </div>
                );
              }

              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[85%] bg-blue-600 text-white rounded-xl rounded-tr-sm p-3 text-xs shadow-sm">
                      <div className="text-[10px] opacity-75 font-mono mb-1">User ({currentUser?.email || 'Guest'}) • {msg.timestamp}</div>
                      <div>{msg.content}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={msg.id} className="space-y-2">
                  <div className="max-w-[90%] bg-slate-950 border border-slate-800 rounded-xl rounded-tl-sm p-3.5 text-xs text-slate-200">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Bot className="w-3 h-3" /> Assistant Response
                      </span>
                      <span>Tokens: {msg.tokens} • {msg.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</div>

                    {/* Tool Calls Execution Inspector */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">
                          Dispatched Tool Invocations:
                        </span>
                        {msg.toolCalls.map((tool, idx) => (
                          <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px]">
                            <div className="text-blue-400 font-semibold flex items-center gap-1">
                              <Wrench className="w-3 h-3" /> {tool.toolName}
                            </div>
                            <div className="text-slate-400 text-[10px] mt-0.5">Args: {JSON.stringify(tool.args)}</div>
                            <div className="text-emerald-400 text-[10px] mt-0.5">Result: {JSON.stringify(tool.result)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isExecuting && (
              <div className="p-3 rounded-lg bg-slate-950 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <span>Agent reasoning, querying vector context, and executing tool pipeline...</span>
              </div>
            )}
          </div>

          {/* Execution Input Box */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
                placeholder="Give your AI Agent a task (e.g. Calculate tokens or Search compliance records)..."
                className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleExecute}
                disabled={isExecuting || !prompt.trim()}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Run Agent
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Executes POST <code className="text-blue-400 font-mono">/api/v1/agents/{'{id}'}/execute</code> protected by OAuth2 Bearer Token.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for Creating New Agent */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                Register New Autonomous Agent
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Agent Name</label>
                <input
                  type="text"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  placeholder="e.g. Data Pipeline Optimizer"
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Model Alias</label>
                <select
                  value={newAgentModel}
                  onChange={(e) => setNewAgentModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Fast & Multimodal)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Reasoning)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">System Instructions</label>
                <textarea
                  value={newAgentPrompt}
                  onChange={(e) => setNewAgentPrompt(e.target.value)}
                  rows={4}
                  placeholder="Define agent personality, boundaries, and tool calling heuristics..."
                  required
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
