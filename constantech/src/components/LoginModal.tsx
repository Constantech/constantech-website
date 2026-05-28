import React, { useState } from "react";
import { X, Unlock, AlertCircle } from "lucide-react";

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: (token: string, username: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok && data.token) {
        onLoginSuccess(data.token, data.username || username);
        onClose();
      } else {
        setError(data.error || "Incorrect credentials. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reach security controller.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" id="login-modal">
      
      {/* Container Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-800 bg-[#070b12] p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
          id="btn-close-login"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
            <Unlock className="h-5 w-5 animate-pulse" />
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
            Administrator Gateway
          </h2>
          <p className="text-xs text-gray-400">
            Sign in to access your sovereign portal CMS.
          </p>
        </div>

        {/* Default Account Hint Badge */}
        <div className="bg-[#0c1424] border border-gray-850/60 rounded-xl p-3 text-center space-y-1">
          <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">// Demo Credentials</p>
          <p className="text-xs text-gray-400 font-mono">
            Username: <span className="text-white font-semibold">admin</span> &nbsp;|&nbsp; Password: <span className="text-white font-semibold">admin</span>
          </p>
        </div>

        {/* Error alerting banner */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 text-xs sm:text-sm flex items-center space-x-2 animate-shake" id="login-error-banner">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Interactive Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans" id="login-form">
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 font-medium">Username</label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="e.g. admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-white font-mono placeholder:text-gray-600"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 font-medium">Password</label>
            <input
              type="password"
              required
              disabled={isLoading}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-white font-mono placeholder:text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            id="btn-submit-login"
            className="w-full mt-2 flex items-center justify-center space-x-1.5 px-6 py-3.5 rounded-xl bg-green-light hover:bg-emerald-400 text-black font-semibold text-sm shadow-lg shadow-emerald-500/10 active:scale-98 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? "Validating security..." : "Unlock Dashboard"}
          </button>
        </form>

      </div>
    </div>
  );
};
