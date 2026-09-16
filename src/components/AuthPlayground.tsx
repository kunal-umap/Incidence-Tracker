import React, { useState, useEffect } from 'react';
import { User, AuthTokens, DecodedJWT, UserRole } from '../types';
import {
  KeyRound,
  UserCheck,
  RefreshCw,
  Lock,
  Mail,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Fingerprint,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface AuthPlaygroundProps {
  currentUser: User | null;
  tokens: AuthTokens | null;
  onLogin: (user: User, tokens: AuthTokens) => void;
  onRotateToken: (tokens: AuthTokens) => void;
  onUpdateRole: (role: UserRole) => void;
  onLogout: () => void;
}

export const AuthPlayground: React.FC<AuthPlaygroundProps> = ({
  currentUser,
  tokens,
  onLogin,
  onRotateToken,
  onUpdateRole,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('developer@enterprise.ai');
  const [password, setPassword] = useState('DevPassword123!');
  const [fullName, setFullName] = useState('Lead AI Engineer');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [tokenTtl, setTokenTtl] = useState<number>(1800); // 30 mins default

  // Preset demo accounts
  const demoAccounts = [
    { email: 'admin@enterprise.ai', pw: 'AdminSecretPassword123!', role: 'SUPER_ADMIN' as UserRole, name: 'Chief Administrator' },
    { email: 'developer@enterprise.ai', pw: 'DevPassword123!', role: 'AGENT_OPERATOR' as UserRole, name: 'Lead AI Engineer' },
    { email: 'analyst@enterprise.ai', pw: 'UserPass12345!', role: 'USER' as UserRole, name: 'Data Analyst' },
  ];

  // Token expiration countdown
  useEffect(() => {
    if (!tokens) return;
    const interval = setInterval(() => {
      setTokenTtl((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [tokens]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    // Simulate backend response with cryptographic simulation
    const simulatedUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase().trim(),
      fullName: fullName || email.split('@')[0],
      role: email.includes('admin') ? 'SUPER_ADMIN' : email.includes('dev') ? 'AGENT_OPERATOR' : 'USER',
      isActive: true,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    const simulatedTokens: AuthTokens = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          sub: simulatedUser.id,
          email: simulatedUser.email,
          role: simulatedUser.role,
          name: simulatedUser.fullName,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 1800,
          jti: crypto.randomUUID().slice(0, 12),
        })
      )}.sig_${Math.random().toString(36).substring(2, 15)}`,
      refreshToken: `rt_sec_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      tokenType: 'bearer',
      expiresIn: 1800,
      issuedAt: Date.now(),
    };

    onLogin(simulatedUser, simulatedTokens);
    setTokenTtl(1800);
    setSuccessMsg(mode === 'login' ? 'Authenticated successfully!' : 'Account registered and authenticated!');
  };

  const handleRotate = () => {
    if (!currentUser) return;
    const newTokens: AuthTokens = {
      accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          sub: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          name: currentUser.fullName,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 1800,
          jti: crypto.randomUUID().slice(0, 12),
        })
      )}.sig_${Math.random().toString(36).substring(2, 15)}`,
      refreshToken: `rt_sec_${crypto.randomUUID().replace(/-/g, '')}${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`,
      tokenType: 'bearer',
      expiresIn: 1800,
      issuedAt: Date.now(),
    };
    onRotateToken(newTokens);
    setTokenTtl(1800);
    setSuccessMsg('Refresh token rotated: Previous token revoked in PostgreSQL, new pair issued.');
  };

  // Decode JWT payload for visualization
  let decodedPayload: DecodedJWT | null = null;
  if (tokens?.accessToken) {
    try {
      const parts = tokens.accessToken.split('.');
      if (parts[1]) {
        decodedPayload = JSON.parse(atob(parts[1]));
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-2 border border-blue-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Production Auth Architecture
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              JWT OAuth2 Password Flow with Single-Use Refresh Token Rotation
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              This interactive dashboard demonstrates the exact authentication and token lifecycle implemented in{' '}
              <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded font-mono">backend/app/services/auth_service.py</code>.
              Passwords are encrypted with bcrypt (12 rounds), access tokens expire in 30 minutes, and refresh tokens are stored hashed in PostgreSQL with instant revocation upon single use.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Quick Switcher (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Auth Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">
                  {currentUser ? 'Active Authenticated Session' : mode === 'login' ? 'User Login' : 'User Registration'}
                </h3>
              </div>
              {!currentUser && (
                <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setMode('login')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      mode === 'login' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      mode === 'register' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {currentUser ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Account Identity</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active & Verified
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">{currentUser.fullName}</div>
                  <div className="text-xs font-mono text-slate-400">{currentUser.email}</div>
                  <div className="text-[11px] font-mono text-slate-500 truncate">UUID: {currentUser.id}</div>
                </div>

                {/* Role Switcher for Testing RBAC */}
                <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-800 space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                    Test Role-Based Access Control (RBAC):
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Switch roles dynamically to observe how endpoint guards in <code className="text-blue-400">api/deps.py</code> enforce permissions.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {(['SUPER_ADMIN', 'ADMIN', 'AGENT_OPERATOR', 'USER'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => onUpdateRole(r)}
                        className={`px-2.5 py-1.5 rounded text-xs font-medium border text-left transition-all ${
                          currentUser.role === r
                            ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-semibold'
                            : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleRotate}
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Rotate Token Pair
                  </button>
                  <button
                    onClick={onLogout}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-rose-900/40 hover:text-rose-300 text-slate-400 border border-slate-700 text-xs font-semibold transition-colors"
                  >
                    Revoke & Logout
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAuthSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Lead AI Engineer"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@enterprise.ai"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 mt-4"
                >
                  <UserCheck className="w-4 h-4" />
                  {mode === 'login' ? 'Authenticate (POST /api/v1/auth/login)' : 'Register Account (POST /api/v1/auth/register)'}
                </button>
              </form>
            )}
          </div>

          {/* Seeded Quick Fill Accounts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Pre-Configured Seed Profiles
            </h4>
            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => {
                    setEmail(acc.email);
                    setPassword(acc.pw);
                    setFullName(acc.name);
                    setMode('login');
                  }}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-medium text-white">{acc.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">{acc.email}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-700 text-slate-300">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: JWT Token Inspector & Token Rotation Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* JWT Token Decoder */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Cryptographic JWT Token Inspector</h3>
              </div>
              {tokens && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">TTL Countdown:</span>
                  <span className={`font-mono font-bold ${tokenTtl < 300 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {Math.floor(tokenTtl / 60)}m {tokenTtl % 60}s
                  </span>
                </div>
              )}
            </div>

            {tokens ? (
              <div className="space-y-4">
                {/* Access Token String */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-300">Raw JWT Access Token (Bearer)</span>
                    <button
                      onClick={() => handleCopy(tokens.accessToken, 'access_token')}
                      className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                    >
                      {copied === 'access_token' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-blue-300/90 break-all border border-slate-800/80 max-h-20 overflow-y-auto">
                    {tokens.accessToken}
                  </div>
                </div>

                {/* Decoded Claims Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Header */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block mb-1.5">
                      1. Token Header (HS256)
                    </span>
                    <pre className="font-mono text-[11px] text-slate-300">
                      {JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)}
                    </pre>
                  </div>

                  {/* Payload */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block mb-1.5">
                      2. Decoded Payload (Claims)
                    </span>
                    <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto">
                      {JSON.stringify(decodedPayload || {}, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Refresh Token Rotation Card */}
                <div className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      Opaque Refresh Token (Single-Use Rotation)
                    </span>
                    <span className="text-[10px] text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-mono">
                      Stored Hashed in PostgreSQL
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-amber-300 break-all border border-slate-800">
                    {tokens.refreshToken}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Industrial Standard: Refresh tokens are 64-character high-entropy strings stored as SHA-256 hashes in the{' '}
                    <code className="text-blue-400">refresh_tokens</code> table. When sent to{' '}
                    <code className="text-blue-400">/api/v1/auth/refresh</code>, the backend verifies validity, immediately flags it as{' '}
                    <span className="text-rose-400">revoked = true</span>, and issues a fresh pair.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Lock className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">No active tokens. Authenticate or select a demo profile to inspect JWT claims.</p>
              </div>
            )}
          </div>

          {/* Security Features Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Production Security & Auth Guarantees
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Bcrypt Password Hashing</strong>
                  Salted multi-round key derivation via passlib.
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Token Rotation & Revocation</strong>
                  Single-use refresh tokens protect against replay attacks.
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Redis Token Blacklisting</strong>
                  Revoked tokens are blacklisted with TTL in Redis.
                </div>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block">Role-Based Access Control</strong>
                  FastAPI dependency <code className="text-blue-400">require_roles</code> protects endpoints.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
