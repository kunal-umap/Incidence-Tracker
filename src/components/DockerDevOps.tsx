import React, { useState } from 'react';
import { DockerServiceStatus } from '../types';
import {
  Server,
  Database,
  Cpu,
  Terminal,
  Copy,
  Check,
  Play,
  Layers,
  Activity,
  CheckCircle2,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

export const DockerDevOps: React.FC = () => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const services: DockerServiceStatus[] = [
    {
      id: 'postgres',
      name: 'PostgreSQL Relational Database',
      image: 'postgres:16-alpine',
      role: 'Primary Persistent Store (UUIDs, Users, Agents, Audit Logs)',
      port: '5432:5432',
      health: 'healthy',
      uptime: '3d 14h',
      metrics: { cpu: '1.2%', memory: '64 MB', latencyMs: 2.4 },
    },
    {
      id: 'redis',
      name: 'Redis In-Memory Cache & Broker',
      image: 'redis:7-alpine',
      role: 'Token Blacklist, Sliding Window Rate Limiter & Celery Queue',
      port: '6379:6379',
      health: 'healthy',
      uptime: '3d 14h',
      metrics: { cpu: '0.4%', memory: '18 MB', latencyMs: 0.8 },
    },
    {
      id: 'backend',
      name: 'Python FastAPI Microservice',
      image: 'enterprise_backend:latest',
      role: 'Async SQLAlchemy 2.0, JWT OAuth2, Pydantic v2 & AI Agent API',
      port: '8000:8000',
      health: 'healthy',
      uptime: '3d 14h',
      metrics: { cpu: '2.1%', memory: '112 MB', latencyMs: 4.1 },
    },
    {
      id: 'worker',
      name: 'Celery Background Task Worker',
      image: 'enterprise_worker:latest',
      role: 'Asynchronous AI Agent Task Pipeline & Distributed Jobs',
      port: 'Internal',
      health: 'healthy',
      uptime: '3d 14h',
      metrics: { cpu: '0.6%', memory: '85 MB', latencyMs: 1.5 },
    },
    {
      id: 'frontend',
      name: 'Frontend Web Container',
      image: 'enterprise_frontend:latest',
      role: 'Nginx Production / Vite Dev Reverse Proxy to backend:8000',
      port: '3000:3000',
      health: 'healthy',
      uptime: '3d 14h',
      metrics: { cpu: '0.2%', memory: '24 MB', latencyMs: 1.1 },
    },
  ];

  const commands = [
    { title: 'Boot Entire Cluster', cmd: 'docker compose up -d --build', desc: 'Builds and launches Postgres, Redis, Backend, Worker, and Frontend' },
    { title: 'Run Alembic Migrations', cmd: 'docker compose exec backend alembic upgrade head', desc: 'Applies database schema changes asynchronously to PostgreSQL' },
    { title: 'Seed Superadmin & Agents', cmd: 'docker compose exec backend python -m app.scripts.seed_db', desc: 'Provisions initial administrator accounts and default AI agent models' },
    { title: 'Run Pytest Async Suite', cmd: 'docker compose exec backend pytest -v', desc: 'Executes unit and integration test suite with coverage' },
    { title: 'Tail Backend Logs', cmd: 'docker compose logs -f backend', desc: 'Streams real-time FastAPI access and error logs' },
    { title: 'Stop All Services', cmd: 'docker compose down', desc: 'Gracefully stops and removes all containers and networks' },
  ];

  const handleCopy = (cmd: string, title: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(title);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2 border border-blue-500/20">
          <Layers className="w-3.5 h-3.5" />
          Containerized Microservices Topology
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Docker Compose Infrastructure & PostgreSQL Orchestration
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          The system runs in isolated, network-bridged Docker containers. The backend waits for PostgreSQL and Redis to pass internal healthchecks before starting FastAPI. The frontend container contains an Nginx reverse proxy routing traffic seamlessly.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((svc) => (
          <div key={svc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {svc.id === 'postgres' ? (
                    <Database className="w-4 h-4 text-blue-400" />
                  ) : svc.id === 'redis' ? (
                    <Cpu className="w-4 h-4 text-rose-400" />
                  ) : svc.id === 'backend' || svc.id === 'worker' ? (
                    <Server className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Layers className="w-4 h-4 text-indigo-400" />
                  )}
                  <span className="font-semibold text-white text-xs">{svc.name}</span>
                </div>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {svc.health}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <div className="text-[11px] text-slate-300 leading-snug">{svc.role}</div>
                <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                  <span className="text-slate-500">Image:</span>
                  <span className="text-slate-300">{svc.image}</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Port Mapping:</span>
                  <span className="text-blue-400">{svc.port}</span>
                </div>
              </div>
            </div>

            {/* Metrics Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block">CPU</span>
                <span className="text-white font-semibold">{svc.metrics.cpu}</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block">Memory</span>
                <span className="text-white font-semibold">{svc.metrics.memory}</span>
              </div>
              <div className="p-1.5 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block">Latency</span>
                <span className="text-emerald-400 font-semibold">{svc.metrics.latencyMs}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Terminal Command Center */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Docker CLI & Makefile Quick Actions</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Ready to paste into terminal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {commands.map((c) => (
            <div key={c.title} className="p-3 rounded-lg bg-slate-950 border border-slate-800/90 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-white">{c.title}</span>
                  <button
                    onClick={() => handleCopy(c.cmd, c.title)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    {copiedCmd === c.title ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedCmd === c.title ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{c.desc}</p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-emerald-400 break-all select-all">
                $ {c.cmd}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
