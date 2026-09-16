export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'AGENT_OPERATOR' | 'USER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  issuedAt: number;
}

export interface DecodedJWT {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
  iat: number;
  type: string;
  jti: string;
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  modelName: string;
  tools: string[];
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  rateLimitPerMinute: number;
  createdAt: string;
}

export interface ToolExecution {
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: ToolExecution[];
  timestamp: string;
  tokens?: number;
}

export interface AgentSession {
  id: string;
  agentId: string;
  title: string;
  messages: AgentMessage[];
  tokenCount: number;
  createdAt: string;
}

export interface DockerServiceStatus {
  id: string;
  name: string;
  image: string;
  role: string;
  port: string;
  health: 'healthy' | 'starting' | 'unhealthy';
  uptime: string;
  metrics: {
    cpu: string;
    memory: string;
    latencyMs: number;
  };
}

export interface CodeFile {
  path: string;
  name: string;
  category: 'docker' | 'core' | 'models' | 'schemas' | 'services' | 'api' | 'migrations' | 'tests';
  language: string;
  description: string;
  content: string;
}
