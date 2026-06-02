import React from "react";
import { Shield, Unlock, LogOut, Settings } from "lucide-react";
import { ConstantechLogo } from "./ConstantechLogo";

interface HeaderProps {
  logoText: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  username?: string;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  logoText,
  activeTab,
  setActiveTab,
  isAuthenticated,
  username,
  onLogout,
  onOpenLogin,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-brand-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo Branding */}
        <div 
          onClick={() => setActiveTab("home")} 
          className="flex cursor-pointer items-center space-x-2 p-1 rounded-lg group"
          id="nav-logo"
        >
          <ConstantechLogo className="h-8 w-8 hover:opacity-90 transition-opacity" />
          <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-green-400 transition-colors">
            {logoText || "Constantech"}
          </span>
        </div>

        {/* Dynamic Service Routes / Page Tabs */}
        <nav className="hidden md:flex items-center space-x-1" id="nav-links">
          <button
            id="tab-home"
            onClick={() => setActiveTab("home")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "home"
                ? "bg-gray-800/60 text-emerald-400 border border-gray-700/50"
                : "text-gray-400 hover:text-white hover:bg-gray-800/30"
            }`}
          >
            Home
          </button>
          <button
            id="tab-webdev"
            onClick={() => setActiveTab("webdev")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "webdev"
                ? "bg-gray-800/60 text-emerald-400 border border-gray-700/50"
                : "text-gray-400 hover:text-white hover:bg-gray-800/30"
            }`}
          >
            Web Engineering
          </button>
          <button
            id="tab-about"
            onClick={() => setActiveTab("about")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "about"
                ? "bg-gray-800/60 text-emerald-400 border border-gray-700/50"
                : "text-gray-400 hover:text-white hover:bg-gray-800/30"
            }`}
          >
            About Constantech
          </button>
        </nav>

        {/* Administration Actions & Session Indicators */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-2 sm:space-x-3" id="admin-badge">
              <span className="hidden lg:inline bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-mono">
                Admin: {username}
              </span>
              <button
                id="btn-goto-cms"
                onClick={() => setActiveTab("cms")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === "cms"
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/10"
                    : "bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700 hover:text-white"
                }`}
                title="Open CMS Editor Dashboard"
              >
                <Settings className="h-3.5 w-3.5 animate-spin-slow" />
                <span>CMS Editor</span>
              </button>
              <button
                id="btn-logout"
                onClick={onLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-950/40 border border-red-900/30 text-red-300 hover:bg-red-900/40 hover:border-red-800/40 transition-all"
                title="Log out from console"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-login"
              onClick={onOpenLogin}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-950/50 transition-all duration-200 pointer-events-auto"
            >
              <Unlock className="h-4 w-4 text-emerald-300" />
              <span>Admin Portal</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav indicator bar */}
      <div className="flex md:hidden border-t border-gray-800/80 bg-brand-bg justify-around py-2 px-1">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex-1 py-1 px-2 text-center text-xs font-medium rounded-lg ${
            activeTab === "home" ? "text-emerald-400 bg-gray-800/50" : "text-gray-400"
          }`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab("webdev")}
          className={`flex-1 py-1 px-2 text-center text-xs font-medium rounded-lg ${
            activeTab === "webdev" ? "text-emerald-400 bg-gray-800/50" : "text-gray-400"
          }`}
        >
          Web
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`flex-1 py-1 px-2 text-center text-xs font-medium rounded-lg ${
            activeTab === "about" ? "text-emerald-400 bg-gray-800/50" : "text-gray-400"
          }`}
        >
          About
        </button>
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab("cms")}
            className={`flex-1 py-1 px-2 text-center text-xs font-medium rounded-lg ${
              activeTab === "cms" ? "text-emerald-400 bg-emerald-950/40" : "text-gray-400"
            }`}
          >
            CMS
          </button>
        )}
      </div>
    </header>
  );
};
