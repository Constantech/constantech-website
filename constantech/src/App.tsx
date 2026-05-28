import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { WebDevPage } from "./components/WebDevPage";
import { AboutPage } from "./components/AboutPage";
import { AdminPanel } from "./components/AdminPanel";
import { LoginModal } from "./components/LoginModal";
import { ConstantechLogo } from "./components/ConstantechLogo";
import { SiteContent } from "./types";
import { Layers } from "lucide-react";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>("home");

  // CMS Content State
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(true);

  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [username, setUsername] = useState<string | undefined>(localStorage.getItem("username") || undefined);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  // Sync token validation against backend on load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        const response = await fetch("/api/auth/check", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setUsername(data.username);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (err) {
        // Fallback to local trust if network is struggling, but stay secure
        setIsAuthenticated(false);
      }
    };
    validateToken();
  }, [token]);

  // Fetch CMS site content on load
  const loadSiteContent = async () => {
    setIsLoadingContent(true);
    try {
      const response = await fetch("/api/content");
      const data = await response.json();
      if (data.success && data.content) {
        setSiteContent(data.content);
      }
    } catch (err) {
      console.error("Failed to load CMS content:", err);
    } finally {
      setIsLoadingContent(false);
    }
  };

  useEffect(() => {
    loadSiteContent();
  }, []);

  // Secure Sign-in handling
  const handleLoginSuccess = (userToken: string, activeUser: string) => {
    localStorage.setItem("token", userToken);
    localStorage.setItem("username", activeUser);
    setToken(userToken);
    setUsername(activeUser);
    setIsAuthenticated(true);
    // Auto navigate to the newly unlocked CMS dashboard
    setActiveTab("cms");
  };

  // Logout handling
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(undefined);
    setIsAuthenticated(false);
    if (activeTab === "cms") {
      setActiveTab("home");
    }
  };

  // High-fidelity full-page loader
  if (isLoadingContent || !siteContent) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-brand-bg text-white space-y-4 font-sans" id="app-loading-screen">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-900 border border-gray-800/60 shadow-xl shadow-emerald-500/5 animate-pulse">
          <ConstantechLogo className="h-12 w-12" />
        </div>
        <div className="space-y-1 text-center">
          <h2 className="font-display text-lg font-bold tracking-tight">Constantech Sovereign Portal</h2>
          <p className="text-xs text-gray-500 font-mono text-center max-w-xs mx-auto">Initializing sandboxed persistence layers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-bg text-gray-100 font-sans selection:bg-green-light selection:text-black" id="app-container">
      
      {/* Header bar */}
      <Header
        logoText={siteContent.logoText || "Constantech"}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAuthenticated={isAuthenticated}
        username={username}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Screen Router */}
      <main className="flex-grow">
        {activeTab === "home" && (
          <HomePage 
            data={siteContent.home} 
            onNavigateToCMS={() => {
              if (isAuthenticated) {
                setActiveTab("cms");
              } else {
                setIsLoginOpen(true);
              }
            }}
          />
        )}
        {activeTab === "webdev" && (
          <WebDevPage data={siteContent.webdev} />
        )}
        {activeTab === "about" && (
          <AboutPage data={siteContent.about} />
        )}
        {activeTab === "cms" && isAuthenticated && (
          <AdminPanel
            token={token || ""}
            siteContent={siteContent}
            onContentSaved={(updatedContent) => setSiteContent(updatedContent)}
          />
        )}
      </main>

      {/* Footer bar */}
      <Footer 
        logoText={siteContent.logoText} 
        footerTagline={siteContent.footerTagline} 
        setActiveTab={setActiveTab}
      />

      {/* Login Screen Gateway Overlay */}
      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}
