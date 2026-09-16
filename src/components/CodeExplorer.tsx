import React, { useState } from 'react';
import { CODE_FILES } from '../data/codebase';
import { CodeFile } from '../types';
import {
  FolderTree,
  FileCode,
  Layers,
  Copy,
  Check,
  Cpu,
  Database,
  Shield,
  FileText,
  Boxes,
} from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(CODE_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'code' | 'architecture'>('code');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'docker', label: 'Docker & Microservices' },
    { id: 'core', label: 'Core Security & DB' },
    { id: 'models', label: 'SQLAlchemy Models' },
    { id: 'services', label: 'Business Logic' },
    { id: 'api', label: 'FastAPI Routers' },
    { id: 'migrations', label: 'Alembic Migrations' },
  ];

  const [activeCategory, setActiveCategory] = useState('all');

  const filteredFiles = activeCategory === 'all'
    ? CODE_FILES
    : CODE_FILES.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Top Controls & Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2 border border-indigo-500/20">
              <Boxes className="w-3.5 h-3.5" />
              Industrial Layered Architecture
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Enterprise Project Structure & Clean Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every file is strictly decoupled into single-responsibility domains: HTTP controllers, business services, DAO repositories, and async SQLAlchemy ORM entities.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg self-start">
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'code' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              File Browser
            </button>
            <button
              onClick={() => setViewMode('architecture')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === 'architecture' ? 'bg-blue-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Architecture Diagram
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'architecture' ? (
        /* Architecture Topology View */
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Request Lifecycle & Clean Architecture Boundary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Layer 1: Client & Nginx */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px]">1</span>
                Client / Nginx
              </div>
              <h4 className="text-xs font-bold text-white">Entry Gateway</h4>
              <p className="text-[11px] text-slate-400">
                Incoming request with <code className="text-blue-300">Authorization: Bearer &lt;token&gt;</code> is forwarded to Python FastAPI backend.
              </p>
              <div className="text-[10px] font-mono bg-slate-900 p-1.5 rounded text-slate-300 border border-slate-800">
                Port 3000 / Port 80
              </div>
            </div>

            {/* Layer 2: API & Dependencies */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px]">2</span>
                API Router & Deps
              </div>
              <h4 className="text-xs font-bold text-white">Guard & Validation</h4>
              <p className="text-[11px] text-slate-400">
                FastAPI dependencies validate JWT, check Redis blacklist, parse Pydantic v2 schemas, and enforce RBAC.
              </p>
              <div className="text-[10px] font-mono bg-slate-900 p-1.5 rounded text-indigo-300 border border-slate-800">
                app/api/deps.py
              </div>
            </div>

            {/* Layer 3: Services Layer */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">3</span>
                Service Domain
              </div>
              <h4 className="text-xs font-bold text-white">Business Logic</h4>
              <p className="text-[11px] text-slate-400">
                Pure business transactions: token rotation logic, password hashing, AI agent reasoning, and audit triggers.
              </p>
              <div className="text-[10px] font-mono bg-slate-900 p-1.5 rounded text-emerald-300 border border-slate-800">
                app/services/
              </div>
            </div>

            {/* Layer 4: Repositories (DAO) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">4</span>
                Repositories (DAO)
              </div>
              <h4 className="text-xs font-bold text-white">Data Access Object</h4>
              <p className="text-[11px] text-slate-400">
                Generic Async CRUD methods and optimized queries using modern SQLAlchemy 2.0 select and execute statements.
              </p>
              <div className="text-[10px] font-mono bg-slate-900 p-1.5 rounded text-amber-300 border border-slate-800">
                app/repositories/
              </div>
            </div>

            {/* Layer 5: PostgreSQL & Redis */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">5</span>
                PostgreSQL & Redis
              </div>
              <h4 className="text-xs font-bold text-white">Durable Storage</h4>
              <p className="text-[11px] text-slate-400">
                PostgreSQL 16 persists relational models, UUIDs, and JSONB sessions. Redis handles blacklists and rate limits.
              </p>
              <div className="text-[10px] font-mono bg-slate-900 p-1.5 rounded text-purple-300 border border-slate-800">
                Port 5432 / Port 6379
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* File Explorer View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree Column (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FolderTree className="w-4 h-4 text-blue-400" />
                Project Files
              </span>
              <span className="text-[11px] text-slate-400">{filteredFiles.length} files</span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* File List */}
            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {filteredFiles.map((file) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <div className="text-slate-200 font-mono text-[11px] truncate">{file.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{file.path}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Column (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
            {/* Header with copy & meta */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white font-mono flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  {selectedFile.path}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
              </div>
              <button
                onClick={handleCopy}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            {/* Code Content */}
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs overflow-x-auto border border-slate-800/80 text-slate-300 max-h-[560px] overflow-y-auto leading-relaxed">
              <pre>
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
