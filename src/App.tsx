import React, { useState } from 'react';
import { User, AuthTokens, UserRole } from './types';
import { Header } from './components/Header';
import { AuthPlayground } from './components/AuthPlayground';
import { CodeExplorer } from './components/CodeExplorer';
import { AgentStudio } from './components/AgentStudio';
import { DockerDevOps } from './components/DockerDevOps';
import { ApiExplorer } from './components/ApiExplorer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('auth');

  // Default pre-seeded logged-in developer session for immediate testability
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: '2c8e7acd-aafc-4c3d-8c4d-bc9efccd5cfe',
    email: 'developer@enterprise.ai',
    fullName: 'Lead AI Engineer',
    role: 'AGENT_OPERATOR',
    isActive: true,
    isVerified: true,
    createdAt: new Date().toISOString(),
  });

  const [tokens, setTokens] = useState<AuthTokens | null>({
    accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
      JSON.stringify({
        sub: '2c8e7acd-aafc-4c3d-8c4d-bc9efccd5cfe',
        email: 'developer@enterprise.ai',
        role: 'AGENT_OPERATOR',
        name: 'Lead AI Engineer',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 1800,
        jti: 'jti_sec_091a7b',
      })
    )}.sig_8f3d1b289ac4e5`,
    refreshToken: 'rt_sec_9941a29810a9bf48b94df9281a0efc882194bca7821048d',
    tokenType: 'bearer',
    expiresIn: 1800,
    issuedAt: Date.now(),
  });

  const handleLogin = (user: User, newTokens: AuthTokens) => {
    setCurrentUser(user);
    setTokens(newTokens);
  };

  const handleRotateToken = (newTokens: AuthTokens) => {
    setTokens(newTokens);
  };

  const handleUpdateRole = (newRole: UserRole) => {
    if (!currentUser) return;
    const updated = { ...currentUser, role: newRole };
    setCurrentUser(updated);

    // Update tokens with the new role claim in JWT
    if (tokens) {
      const updatedJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          sub: updated.id,
          email: updated.email,
          role: updated.role,
          name: updated.fullName,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 1800,
          jti: crypto.randomUUID().slice(0, 10),
        })
      )}.sig_role_${newRole.toLowerCase()}`;
      setTokens({ ...tokens, accessToken: updatedJwt });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTokens(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation & Status Bar */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'auth' && (
          <AuthPlayground
            currentUser={currentUser}
            tokens={tokens}
            onLogin={handleLogin}
            onRotateToken={handleRotateToken}
            onUpdateRole={handleUpdateRole}
            onLogout={handleLogout}
          />
        )}

        {activeTab === 'agents' && (
          <AgentStudio currentUser={currentUser} />
        )}

        {activeTab === 'code' && (
          <CodeExplorer />
        )}

        {activeTab === 'docker' && (
          <DockerDevOps />
        )}

        {activeTab === 'api' && (
          <ApiExplorer
            currentUser={currentUser}
            tokens={tokens}
          />
        )}
      </main>

      {/* Clean Industrial Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Enterprise Python & PostgreSQL Backend Platform • FastAPI • Async SQLAlchemy 2.0 • Redis 7 • Celery • Docker
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
            <span>Clean Architecture</span>
            <span>•</span>
            <span>Single-Use Refresh Rotation</span>
            <span>•</span>
            <span>Multi-Stage Docker</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
