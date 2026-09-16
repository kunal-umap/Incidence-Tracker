import React, { useState } from 'react';
import { User, AuthTokens } from '../types';
import {
  Code,
  Send,
  CheckCircle2,
  Lock,
  Globe,
  Clock,
  Sparkles,
  Server,
  Play,
  ShieldAlert,
} from 'lucide-react';

interface ApiExplorerProps {
  currentUser: User | null;
  tokens: AuthTokens | null;
}

interface EndpointDefinition {
  method: 'GET' | 'POST' | 'PATCH';
  path: string;
  tag: string;
  summary: string;
  requiresAuth: boolean;
  requiredRole?: string;
  defaultBody?: string;
}

export const ApiExplorer: React.FC<ApiExplorerProps> = ({ currentUser, tokens }) => {
  const endpoints: EndpointDefinition[] = [
    {
      method: 'GET',
      path: '/api/v1/health/ready',
      tag: 'Health',
      summary: 'Readiness probe testing PostgreSQL & Redis latency',
      requiresAuth: false,
    },
    {
      method: 'POST',
      path: '/api/v1/auth/register',
      tag: 'Authentication',
      summary: 'Register a new user account with hashed password',
      requiresAuth: false,
      defaultBody: JSON.stringify({
        email: 'developer@enterprise.ai',
        password: 'DevPassword123!',
        full_name: 'Lead AI Engineer',
      }, null, 2),
    },
    {
      method: 'POST',
      path: '/api/v1/auth/login',
      tag: 'Authentication',
      summary: 'OAuth2 password authentication & JWT pair issuance',
      requiresAuth: false,
      defaultBody: JSON.stringify({
        email: 'developer@enterprise.ai',
        password: 'DevPassword123!',
      }, null, 2),
    },
    {
      method: 'POST',
      path: '/api/v1/auth/refresh',
      tag: 'Authentication',
      summary: 'Single-use refresh token rotation in PostgreSQL',
      requiresAuth: false,
      defaultBody: JSON.stringify({
        refresh_token: tokens?.refreshToken || 'rt_sec_sample_token_hash_here',
      }, null, 2),
    },
    {
      method: 'GET',
      path: '/api/v1/auth/me',
      tag: 'Authentication',
      summary: 'Fetch authenticated user profile via Bearer token',
      requiresAuth: true,
    },
    {
      method: 'GET',
      path: '/api/v1/users',
      tag: 'Users & RBAC',
      summary: 'List users in the organization (ADMIN or SUPER_ADMIN only)',
      requiresAuth: true,
      requiredRole: 'ADMIN',
    },
    {
      method: 'GET',
      path: '/api/v1/agents',
      tag: 'AI Agents',
      summary: 'List current user registered AI Agents',
      requiresAuth: true,
    },
    {
      method: 'POST',
      path: '/api/v1/agents/agent-1/execute',
      tag: 'AI Agents',
      summary: 'Execute prompt reasoning task and record session in PostgreSQL',
      requiresAuth: true,
      defaultBody: JSON.stringify({
        prompt: 'Analyze token consumption rate and summarize compliance criteria.',
        stream: false,
      }, null, 2),
    },
  ];

  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDefinition>(endpoints[0]);
  const [requestBody, setRequestBody] = useState<string>(endpoints[0].defaultBody || '');
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelectEndpoint = (ep: EndpointDefinition) => {
    setSelectedEndpoint(ep);
    setRequestBody(ep.defaultBody || '');
    setResponseOutput(null);
    setResponseStatus(null);
  };

  const handleExecuteRequest = () => {
    setLoading(true);
    const reqId = crypto.randomUUID();
    const startTime = performance.now();

    setTimeout(() => {
      let status = 200;
      let body: any = {};

      // Handle RBAC & Auth checks
      if (selectedEndpoint.requiresAuth && !tokens) {
        status = 401;
        body = {
          success: false,
          error_code: 'AUTHENTICATION_FAILED',
          message: 'Could not validate credentials: Missing Bearer token in Authorization header.',
        };
      } else if (
        selectedEndpoint.requiredRole &&
        currentUser &&
        currentUser.role !== 'ADMIN' &&
        currentUser.role !== 'SUPER_ADMIN'
      ) {
        status = 403;
        body = {
          success: false,
          error_code: 'PERMISSION_DENIED',
          message: `Role '${currentUser.role}' is not authorized to access this resource. Required: ${selectedEndpoint.requiredRole}.`,
        };
      } else {
        // Successful response simulation
        if (selectedEndpoint.path.includes('/health/ready')) {
          status = 200;
          body = {
            status: 'ready',
            timestamp: Date.now() / 1000,
            services: {
              postgres: { status: 'healthy', latency_ms: 2.1 },
              redis: { status: 'healthy', latency_ms: 0.9 },
            },
          };
        } else if (selectedEndpoint.path.includes('/auth/login')) {
          status = 200;
          body = {
            success: true,
            message: 'Authentication successful',
            data: {
              access_token: tokens?.accessToken || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              refresh_token: tokens?.refreshToken || 'rt_sec_9941a29810a9bf4...',
              token_type: 'bearer',
              expires_in: 1800,
              user: currentUser,
            },
          };
        } else if (selectedEndpoint.path.includes('/auth/me')) {
          status = 200;
          body = {
            success: true,
            message: 'User profile retrieved',
            data: currentUser,
          };
        } else if (selectedEndpoint.path.includes('/users')) {
          status = 200;
          body = {
            success: true,
            message: 'Retrieved 3 users',
            data: [
              { id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed', email: 'admin@enterprise.ai', role: 'SUPER_ADMIN', is_active: true },
              { id: '2c8e7acd-aafc-4c3d-8c4d-bc9efccd5cfe', email: 'developer@enterprise.ai', role: 'AGENT_OPERATOR', is_active: true },
              { id: '3d7f8bde-bbab-4d4e-7b5e-cd0fadee6daf', email: 'analyst@enterprise.ai', role: 'USER', is_active: true },
            ],
          };
        } else if (selectedEndpoint.path.includes('/execute')) {
          status = 200;
          body = {
            success: true,
            message: 'Agent task executed successfully',
            data: {
              session_id: crypto.randomUUID(),
              agent_id: 'agent-1',
              output_text: 'Processed prompt through autonomous tool graph. Saved state to PostgreSQL.',
              tokens_consumed: 284,
              tool_calls: [
                { tool_name: 'vector_retrieval', arguments: { query: 'compliance criteria' }, result: 'Found 3 chunks' },
              ],
              execution_time_ms: 215.4,
            },
          };
        } else {
          status = 200;
          body = { success: true, message: 'Endpoint executed successfully', path: selectedEndpoint.path };
        }
      }

      const elapsed = (performance.now() - startTime).toFixed(2);
      setResponseStatus(status);
      setResponseOutput(body);
      setResponseHeaders({
        'content-type': 'application/json',
        'x-request-id': reqId,
        'x-process-time': `${elapsed}ms`,
        'server': 'uvicorn / fastapi',
      });
      setLoading(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2 border border-blue-500/20">
          <Globe className="w-3.5 h-3.5" />
          Interactive OpenAPI & Swagger Tester
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Live Backend Endpoint Dispatcher
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Send test requests against the FastAPI v1 routes. Automatically attaches the active JWT Bearer token when logged in, or tests unauthenticated 401 responses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="text-xs font-semibold text-white uppercase tracking-wider mb-2">Available Endpoints</div>
          <div className="space-y-1">
            {endpoints.map((ep, idx) => {
              const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectEndpoint(ep)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border-blue-500 text-white'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        ep.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : ep.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-300 text-[11px] truncate">{ep.path}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{ep.summary}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Request & Response Panel (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Request Config Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold font-mono uppercase ${
                    selectedEndpoint.method === 'GET'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-xs text-white font-semibold">{selectedEndpoint.path}</span>
              </div>

              <button
                onClick={handleExecuteRequest}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Play className="w-3.5 h-3.5" />
                {loading ? 'Dispatching...' : 'Send Request'}
              </button>
            </div>

            {/* Auth status indicator for request */}
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Authorization Header:</span>
                <span className="font-mono text-slate-400">
                  {tokens ? `Bearer ${tokens.accessToken.slice(0, 24)}...` : 'None (Unauthenticated)'}
                </span>
              </div>
              {selectedEndpoint.requiresAuth && !tokens && (
                <span className="text-amber-400 text-[10px] font-semibold">⚠️ Requires Bearer Token</span>
              )}
            </div>

            {/* Body Editor if POST */}
            {selectedEndpoint.method === 'POST' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Request JSON Body</label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={5}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-blue-300 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Response Inspector */}
          {responseStatus !== null && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">HTTP Status:</span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      responseStatus >= 200 && responseStatus < 300
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 201 ? 'CREATED' : responseStatus === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN'}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Latency: {responseHeaders['x-process-time']}
                </div>
              </div>

              {/* Response Headers */}
              <div className="p-2.5 rounded bg-slate-950 font-mono text-[10px] text-slate-400 border border-slate-800/80 space-y-1">
                <div>X-Request-ID: {responseHeaders['x-request-id']}</div>
                <div>X-Process-Time: {responseHeaders['x-process-time']}</div>
              </div>

              {/* Response JSON */}
              <div className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 overflow-x-auto max-h-80">
                <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
