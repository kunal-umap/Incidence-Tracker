import React from 'react';
import { User } from '../types';
import { Shield, Server, Database, Cpu, LogOut, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    { id: 'auth', label: 'Auth & JWT Simulator' },
    { id: 'agents', label: 'AI Agent Engine' },
    { id: 'code', label: 'Clean Architecture Explorer' },
    { id: 'docker', label: 'Docker & Microservices' },
    { id: 'api', label: 'Swagger API Tester' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50">
      {/* Top Bar: Cluster Status & Service Health */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Docker Topology Active
          </span>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-blue-400" /> PostgreSQL 16 (Port 5432)
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-rose-400" /> Redis 7 (Port 6379)
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5 text-emerald-400" /> FastAPI (Port 8000)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 font-mono text-xs">{currentUser.email}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {currentUser.role}
              </span>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Log Out & Revoke Refresh Token"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-amber-400/90 flex items-center gap-1 text-xs">
              <span>Unauthenticated Session</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              Enterprise Python Platform
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                FastAPI + Asyncpg
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Clean Architecture • JWT Token Rotation • AI Agent Scalability • Multi-stage Docker
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
