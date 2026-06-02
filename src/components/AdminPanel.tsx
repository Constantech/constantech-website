import React, { useState, useEffect, useRef } from "react";
import { 
  Save, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  X, 
  Lock, 
  Settings, 
  Globe, 
  Home, 
  Code, 
  Download, 
  Info, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  HardDrive,
  Activity,
  Database,
  Cpu,
  History
} from "lucide-react";
import { SiteContent, MediaAsset } from "../types";

interface AdminPanelProps {
  token: string;
  siteContent: SiteContent;
  onContentSaved: (updatedContent: SiteContent) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ token, siteContent, onContentSaved }) => {
  // Navigation for Admin Panel Tabs
  const [activeSubTab, setActiveSubTab] = useState<"home" | "webdev" | "about" | "global" | "media" | "backups" | "system" | "security">("home");
  
  // Local Copy of Site Content for modification before saving
  const [localContent, setLocalContent] = useState<SiteContent>({ ...siteContent });
  
  // Media asset list and upload states
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error" | "loading" | null, message: string }>({ type: null, message: "" });
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Backups and diagnostics states
  const [backups, setBackups] = useState<{ filename: string, createdAt: string, size: string }[]>([]);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [backupsStatus, setBackupsStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  // Security Form state
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

  // Overall saving indicator
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

  // Sync state if siteContent updates from parent
  useEffect(() => {
    setLocalContent({ ...siteContent });
  }, [siteContent]);

  // Backups & System Stats Fetchers
  const fetchBackups = async () => {
    setIsBackupLoading(true);
    setBackupsStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/backups", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBackups(data.backups || []);
      } else {
        setBackupsStatus({ type: "error", message: data.error || "Failed to load database backups snapshot list." });
      }
    } catch (err: any) {
      setBackupsStatus({ type: "error", message: err.message || "Failed to make list request." });
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to restore the site content to this backup checkpoint? This will overwrite the current live configuration.`)) return;
    setBackupsStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/backups/restore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ filename })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setBackupsStatus({ type: "success", message: data.message || "Rollback succeeded!" });
        // Retrieve newly restored site values
        const contentRes = await fetch("/api/content");
        const contentData = await contentRes.json();
        if (contentData.success && contentData.content) {
          onContentSaved(contentData.content);
        }
      } else {
        setBackupsStatus({ type: "error", message: data.error || "Failed to restore backup snapshot state." });
      }
    } catch (err: any) {
      setBackupsStatus({ type: "error", message: err.message || "Error during rollback." });
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete this backup snapshot permanently?`)) return;
    setBackupsStatus({ type: null, message: "" });
    try {
      const response = await fetch(`/api/backups/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBackupsStatus({ type: "success", message: "Backup snapshot deleted." });
        setBackups(backups.filter(b => b.filename !== filename));
        setTimeout(() => setBackupsStatus({ type: null, message: "" }), 3000);
      } else {
        setBackupsStatus({ type: "error", message: data.error || "Failed to delete backup." });
      }
    } catch (err: any) {
      setBackupsStatus({ type: "error", message: err.message || "Error deleting snapshot." });
    }
  };

  const fetchSystemMetrics = async () => {
    setIsMetricsLoading(true);
    try {
      const response = await fetch("/api/system/status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSystemMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Failed to fetch system metrics: ", err);
    } finally {
      setIsMetricsLoading(false);
    }
  };

  const downloadSystemFile = async (fileName: "content.json" | "users.json" | "package-lock.json") => {
    try {
      const response = await fetch(`/api/system/download-file?file=${fileName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ error: `HTTP status ${response.status}` }));
        throw new Error(errJson.error || "Failed to make file download call.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const tempAnchor = document.createElement("a");
      tempAnchor.href = url;
      tempAnchor.download = fileName;
      document.body.appendChild(tempAnchor);
      tempAnchor.click();
      document.body.removeChild(tempAnchor);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`System File Download Error: ${err.message}`);
    }
  };

  useEffect(() => {
    if (activeSubTab === "backups") {
      fetchBackups();
    } else if (activeSubTab === "system") {
      fetchSystemMetrics();
    }
  }, [activeSubTab, token]);

  // Fetch Media Assets on mount or tab select
  const fetchMediaAssets = async () => {
    try {
      const response = await fetch("/api/media", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMediaAssets(data.media || []);
      }
    } catch (err) {
      console.error("Failed to load assets: ", err);
    }
  };

  useEffect(() => {
    if (activeSubTab === "media") {
      fetchMediaAssets();
    }
  }, [activeSubTab, token]);

  // Save content changes (PUT /api/content)
  const handleSaveContent = async () => {
    setSaveStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(localContent)
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setSaveStatus({ type: "success", message: "CMS Content updated successfully!" });
        onContentSaved(localContent);
        setTimeout(() => setSaveStatus({ type: null, message: "" }), 3000);
      } else {
        setSaveStatus({ type: "error", message: result.error || "Failed to update content." });
      }
    } catch (err: any) {
      setSaveStatus({ type: "error", message: err.message || "Network Save Failure." });
    }
  };

  // Helper file uploader via base64 encoding
  const uploadFile = async (file: File) => {
    setUploadStatus({ type: "loading", message: `Uploading ${file.name}...` });
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            filename: file.name,
            fileData: base64data
          })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setUploadStatus({ type: "success", message: "Asset successfully uploaded!" });
          fetchMediaAssets();
          setTimeout(() => setUploadStatus({ type: null, message: "" }), 3000);
        } else {
          setUploadStatus({ type: "error", message: data.error || "Upload failed" });
        }
      };
    } catch (err: any) {
      setUploadStatus({ type: "error", message: err.message || "File upload failed." });
    }
  };

  // Drag and Drop Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  // Copy hotlink to clipboard
  const handleCopyLink = (url: string) => {
    const absoluteUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(absoluteUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  // Delete uploaded media asset
  const handleDeleteMedia = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;
    try {
      const response = await fetch(`/api/media/${filename}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMediaAssets(mediaAssets.filter(item => item.filename !== filename));
      } else {
        alert(data.error || "Failed to delete product asset.");
      }
    } catch (err) {
      alert("Error occurred deleting asset.");
    }
  };

  // Change password credentials flow
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await response.json();
      if (response.ok) {
        setPasswordStatus({ type: "success", message: "Credentials successfully updated!" });
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordStatus({ type: "error", message: data.error || "Password change failed" });
      }
    } catch (err: any) {
      setPasswordStatus({ type: "error", message: err.message || "Failed to contact auth server." });
    }
  };

  // Generic content handlers
  const updateHomeText = (key: keyof typeof localContent.home, val: any) => {
    setLocalContent({
      ...localContent,
      home: {
        ...localContent.home,
        [key]: val
      }
    });
  };

  const updateWebdevText = (key: keyof typeof localContent.webdev, val: any) => {
    setLocalContent({
      ...localContent,
      webdev: {
        ...localContent.webdev,
        [key]: val
      }
    });
  };

  const updateAboutText = (key: keyof typeof localContent.about, val: any) => {
    setLocalContent({
      ...localContent,
      about: {
        ...localContent.about,
        [key]: val
      }
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8" id="admin-panel-container">
      
      {/* CMS Dashboard Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <span className="text-xs font-mono text-emerald-400">// Constantech Control Console</span>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Administrator Core CMS
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time visual content editor & asset brokerage. Updates take effect immediately.
          </p>
        </div>

        {/* Global Save Trigger */}
        {activeSubTab !== "media" && activeSubTab !== "security" && activeSubTab !== "backups" && activeSubTab !== "system" && (
          <button
            id="btn-global-save"
            onClick={handleSaveContent}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-green-light text-black font-semibold text-sm hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 active:scale-98 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Publish Updates</span>
          </button>
        )}
      </div>

      {/* Saving and system banners */}
      {saveStatus.message && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 border ${
          saveStatus.type === "success" 
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
            : "bg-red-950/20 border-red-500/30 text-red-300"
        }`} id="save-status-banner">
          {saveStatus.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-sans">{saveStatus.message}</span>
        </div>
      )}

      {/* Editor Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-900 pb-3" id="cms-tab-selector">
        <button
          onClick={() => setActiveSubTab("home")}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeSubTab === "home" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "text-gray-400 hover:text-white"
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Home Page</span>
        </button>
        
        <button
          onClick={() => setActiveSubTab("webdev")}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeSubTab === "webdev" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "text-gray-400 hover:text-white"
          }`}
        >
          <Code className="h-4 w-4" />
          <span>Web Engineering</span>
        </button>

        <button
          onClick={() => setActiveSubTab("about")}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeSubTab === "about" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "text-gray-400 hover:text-white"
          }`}
        >
          <Info className="h-4 w-4" />
          <span>About Timeline</span>
        </button>

        <button
          onClick={() => setActiveSubTab("global")}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeSubTab === "global" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "text-gray-400 hover:text-white"
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Global Params</span>
        </button>

        <button
          onClick={() => setActiveSubTab("media")}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeSubTab === "media" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "text-gray-400 hover:text-white"
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Media Assets</span>
        </button>

        <button
          onClick={() => setActiveSubTab("backups")}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeSubTab === "backups" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "text-gray-400 hover:text-white"
          }`}
        >
          <History className="h-4 w-4" />
          <span>Content Backups</span>
        </button>

        <button
          onClick={() => setActiveSubTab("system")}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeSubTab === "system" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "text-gray-400 hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>System Diagnostics</span>
        </button>

        <button
          onClick={() => setActiveSubTab("security")}
          className={`flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
            activeSubTab === "security" ? "bg-emerald-950/40 text-emerald-300 border border-emerald-500/20" : "text-gray-400 hover:text-white"
          }`}
        >
          <Lock className="h-4 w-4" />
          <span>Security</span>
        </button>
      </div>

      {/* -------------------- TAB CONTENT -------------------- */}
      <div className="bg-[#0b1019] rounded-2xl border border-gray-800 p-6 sm:p-8" id="cms-tab-content">
        
        {/* TAB 1: HOME PAGE EDIT */}
        {activeSubTab === "home" && (
          <div className="space-y-8" id="cms-home-form">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Hero Header Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Hero Badge Tagline</label>
                <input
                  type="text"
                  value={localContent.home.heroBadge}
                  onChange={(e) => updateHomeText("heroBadge", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Hero Title (Display header)</label>
                <input
                  type="text"
                  value={localContent.home.heroTitle}
                  onChange={(e) => updateHomeText("heroTitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={localContent.home.heroSubtitle}
                  onChange={(e) => updateHomeText("heroSubtitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mt-12 mb-4 border-b border-gray-800 pb-2">Service Panel: Opportunity Mapping</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Opportunity Section Title</label>
                <input
                  type="text"
                  value={localContent.home.service1Title}
                  onChange={(e) => updateHomeText("service1Title", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Visual Image Asset URL (Copy from Media tab)</label>
                <input
                  type="text"
                  value={localContent.home.service1Img}
                  onChange={(e) => updateHomeText("service1Img", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-emerald-400"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Opportunity Description</label>
                <textarea
                  rows={2}
                  value={localContent.home.service1Desc}
                  onChange={(e) => updateHomeText("service1Desc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mt-12 mb-4 border-b border-gray-800 pb-2">Service Panel 2: The Undeniable Reality</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Section Title</label>
                <input
                  type="text"
                  value={localContent.home.service2Title}
                  onChange={(e) => updateHomeText("service2Title", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Action Link Text</label>
                <input
                  type="text"
                  value={localContent.home.service2LinkText}
                  onChange={(e) => updateHomeText("service2LinkText", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Reality Description</label>
                <textarea
                  rows={2}
                  value={localContent.home.service2Desc}
                  onChange={(e) => updateHomeText("service2Desc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mt-12 mb-4 border-b border-gray-800 pb-2">Service Panel 3: Game Changer Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Section Title</label>
                <input
                  type="text"
                  value={localContent.home.service3Title}
                  onChange={(e) => updateHomeText("service3Title", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Section Image URL</label>
                <input
                  type="text"
                  value={localContent.home.service3Img}
                  onChange={(e) => updateHomeText("service3Img", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-emerald-400"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Game Changer Description</label>
                <textarea
                  rows={2}
                  value={localContent.home.service3Desc}
                  onChange={(e) => updateHomeText("service3Desc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEBDEV PAGE EDIT */}
        {activeSubTab === "webdev" && (
          <div className="space-y-8" id="cms-webdev-form">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Hero Header Section</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Hero Badge Tagline</label>
                <input
                  type="text"
                  value={localContent.webdev.heroBadge}
                  onChange={(e) => updateWebdevText("heroBadge", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Hero Title (Display header)</label>
                <input
                  type="text"
                  value={localContent.webdev.heroTitle}
                  onChange={(e) => updateWebdevText("heroTitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={localContent.webdev.heroSubtitle}
                  onChange={(e) => updateWebdevText("heroSubtitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mt-12 mb-4 border-b border-gray-800 pb-2">Section 1: Client & Server layers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Section Heading Badge</label>
                <input
                  type="text"
                  value={localContent.webdev.section1Title}
                  onChange={(e) => updateWebdevText("section1Title", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Section Main Subheading</label>
                <input
                  type="text"
                  value={localContent.webdev.section1Subtitle}
                  onChange={(e) => updateWebdevText("section1Subtitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1 pt-2 border-t border-gray-900">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Client Frontend Card Title</label>
                <input
                  type="text"
                  value={localContent.webdev.section1ClientTitle}
                  onChange={(e) => updateWebdevText("section1ClientTitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none font-semibold text-emerald-400"
                />
              </div>
              <div className="space-y-1 pt-2 border-t border-gray-900 font-sans">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Server Orchestration Card Title</label>
                <input
                  type="text"
                  value={localContent.webdev.section1ServerTitle}
                  onChange={(e) => updateWebdevText("section1ServerTitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none font-semibold text-emerald-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Client Frontend Description</label>
                <textarea
                  rows={2}
                  value={localContent.webdev.section1ClientDesc}
                  onChange={(e) => updateWebdevText("section1ClientDesc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Server Orchestration Description</label>
                <textarea
                  rows={2}
                  value={localContent.webdev.section1ServerDesc}
                  onChange={(e) => updateWebdevText("section1ServerDesc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mt-12 mb-4 border-b border-gray-800 pb-2">Section 2: Database Storage Layers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Data Subheading Badge</label>
                <input
                  type="text"
                  value={localContent.webdev.section2Title}
                  onChange={(e) => updateWebdevText("section2Title", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Data Layer Main Subtitle</label>
                <input
                  type="text"
                  value={localContent.webdev.section2Subtitle}
                  onChange={(e) => updateWebdevText("section2Subtitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Data Layer Image asset URL</label>
                <input
                  type="text"
                  value={localContent.webdev.section2Img}
                  onChange={(e) => updateWebdevText("section2Img", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-emerald-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Active Node Floating Banner Status text</label>
                <input
                  type="text"
                  value={localContent.webdev.section2FloatingStatus}
                  onChange={(e) => updateWebdevText("section2FloatingStatus", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none font-mono"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Database Sovereignty Description</label>
                <textarea
                  rows={2}
                  value={localContent.webdev.section2Desc}
                  onChange={(e) => updateWebdevText("section2Desc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ABOUT PAGE EDIT */}
        {activeSubTab === "about" && (
          <div className="space-y-8" id="cms-about-form">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Hero Timeline Bio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Hero Timeline Badge Tag</label>
                <input
                  type="text"
                  value={localContent.about.heroBadge}
                  onChange={(e) => updateAboutText("heroBadge", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Hero Title</label>
                <input
                  type="text"
                  value={localContent.about.heroTitle}
                  onChange={(e) => updateAboutText("heroTitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Bio Image Asset URL</label>
                <input
                  type="text"
                  value={localContent.about.heroImg}
                  onChange={(e) => updateAboutText("heroImg", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-emerald-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Image Caption / Quote phrase</label>
                <input
                  type="text"
                  value={localContent.about.heroQuote}
                  onChange={(e) => updateAboutText("heroQuote", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Evolving Biography Subtitle</label>
                <textarea
                  rows={2}
                  value={localContent.about.heroSubtitle}
                  onChange={(e) => updateAboutText("heroSubtitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mt-12 mb-4 border-b border-gray-800 pb-2">The Pivot Section Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Pivot Year Badge heading</label>
                <input
                  type="text"
                  value={localContent.about.pivotYearTitle}
                  onChange={(e) => updateAboutText("pivotYearTitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Right Block Subheading</label>
                <input
                  type="text"
                  value={localContent.about.pivotRightTitle}
                  onChange={(e) => updateAboutText("pivotRightTitle", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Pivot History Description</label>
                <textarea
                  rows={3}
                  value={localContent.about.pivotYearDesc}
                  onChange={(e) => updateAboutText("pivotYearDesc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Right Block Focus Description</label>
                <textarea
                  rows={3}
                  value={localContent.about.pivotRightDesc}
                  onChange={(e) => updateAboutText("pivotRightDesc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white mt-12 mb-4 border-b border-gray-800 pb-2">Corporative Philosophy Callout</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Big Quote Phrase</label>
                <input
                  type="text"
                  value={localContent.about.philosophyBigQuote}
                  onChange={(e) => updateAboutText("philosophyBigQuote", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none italic text-emerald-400 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium tracking-wide">Philosophy Supporting text</label>
                <textarea
                  rows={2}
                  value={localContent.about.philosophyDesc}
                  onChange={(e) => updateAboutText("philosophyDesc", e.target.value)}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GLOBAL PARAMS */}
        {activeSubTab === "global" && (
          <div className="space-y-6" id="cms-global-form">
            <h3 className="text-base sm:text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Global UI Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-bold tracking-wide">Corporative Logo Brand Title</label>
                <input
                  type="text"
                  value={localContent.logoText}
                  onChange={(e) => setLocalContent({ ...localContent, logoText: e.target.value })}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none font-bold text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-bold tracking-wide">Footer Brand Tagline Phrase</label>
                <input
                  type="text"
                  value={localContent.footerTagline}
                  onChange={(e) => setLocalContent({ ...localContent, footerTagline: e.target.value })}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: MEDIA MANAGER & DRAG AND DROP FILE UPLOADS */}
        {activeSubTab === "media" && (
          <div className="space-y-8" id="cms-media-section">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">Media Manager Drawer</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-0.5 font-sans">
                  Drag and drop any workspace file asset to instantly upload and use!
                </p>
              </div>

              {/* Status indicator */}
              {uploadStatus.message && (
                <div className={`px-4 py-2 rounded-lg text-xs font-mono border flex items-center space-x-2 ${
                  uploadStatus.type === "loading" ? "bg-blue-950/20 border-blue-500/30 text-blue-400 animate-pulse" :
                  uploadStatus.type === "success" ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-400" :
                  "bg-red-950/30 border-red-500/20 text-red-400"
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  <span>{uploadStatus.message}</span>
                </div>
              )}
            </div>

            {/* Drag & Drop uploader area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                isDragging 
                  ? "border-green-light bg-emerald-950/10 scale-[1.01]" 
                  : "border-gray-800 hover:border-gray-700 bg-brand-bg"
              }`}
              id="drag-drop-zone"
            >
              <div className="max-w-md mx-auto flex flex-col items-center space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 shadow-inner">
                  <Upload className="h-6 w-6 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white font-sans">
                    Drag and drop file here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    Supports PNG, JPG, GIF up to 10MB sizes. Files are processed securely.
                  </p>
                </div>
                
                <label className="cursor-pointer inline-flex items-center space-x-1.5 bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-gray-100 font-sans transition-colors">
                  <span>Browse Files</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            </div>

            {/* Media Asset grid list */}
            <div className="space-y-4" id="uploaded-assets-container">
              <div className="flex items-center space-x-1 border-b border-gray-900 pb-2">
                <HardDrive className="h-4 w-4 text-emerald-500" />
                <h4 className="text-xs font-mono uppercase tracking-widest text-gray-400">Published Asset Vault</h4>
              </div>

              {mediaAssets.length === 0 ? (
                <div className="text-center py-10 rounded-xl bg-[#090f19] border border-gray-900 text-gray-500 text-sm">
                  Asset Vault is currently empty. Upload your first hotlink file above!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" id="media-assets-grid">
                  {mediaAssets.map((asset) => (
                    <div 
                      key={asset.filename} 
                      className="rounded-xl border border-gray-800/80 bg-[#090f19] overflow-hidden group flex flex-col justify-between"
                    >
                      {/* Thumbnail view */}
                      <div className="relative aspect-video bg-black/40 border-b border-gray-900 flex items-center justify-center overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.filename} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleCopyLink(asset.url)}
                            className="bg-[#090f16]/90 border border-gray-700 rounded p-1.5 text-white hover:bg-black font-semibold text-xs transition-colors"
                            title="Copy Hotlink Address"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMedia(asset.filename)}
                            className="bg-red-950/90 border border-red-800/60 rounded p-1.5 text-red-400 hover:bg-black font-semibold text-xs transition-colors"
                            title="Delete Asset"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content metadata */}
                      <div className="p-3 space-y-1">
                        <p className="text-xs font-semibold text-gray-300 truncate font-mono" title={asset.filename}>
                          {asset.filename.replace(/^\d+-/, "")}
                        </p>
                        <div className="flex items-center justify-between text-[9px] font-mono text-gray-500">
                          <span>{asset.size || "Unknown"}</span>
                          <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Copied visual tooltip info */}
                      {copiedUrl === asset.url && (
                        <div className="bg-emerald-950 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono text-center py-1">
                          ✔ Hotlink Copied!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: SECURITY FLOW UPDATE */}
        {activeSubTab === "security" && (
          <div className="max-w-md" id="cms-security-section">
            <span className="text-xs font-mono text-emerald-500 tracking-wider font-bold block uppercase">// Access Protection</span>
            <h3 className="text-base sm:text-lg font-bold text-white mb-4">Change Administrator Credentials</h3>

            {/* Password feedback Banner */}
            {passwordStatus.message && (
              <div className={`p-4 rounded-xl mb-6 flex items-center space-x-2.5 border ${
                passwordStatus.type === "success" 
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/20 border-red-500/30 text-red-300"
              }`} id="password-feedback">
                {passwordStatus.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                <span className="text-sm font-sans">{passwordStatus.message}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4" id="password-update-form">
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium">Verify Old Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium">Type New CMS Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 font-medium">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full bg-brand-bg rounded-xl border border-gray-800 p-3 text-sm focus:border-green-light outline-none text-white font-mono"
                />
              </div>

              <button
                type="submit"
                id="btn-save-credentials"
                className="w-full mt-2 flex items-center justify-center space-x-1.5 px-6 py-3 rounded-xl bg-gray-100 hover:bg-white text-black font-semibold text-sm transition-all"
              >
                <Lock className="h-4 w-4" />
                <span>Save New Secret</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB: CONTENT BACKUPS & ROLLBACK MANAGEMENT */}
        {activeSubTab === "backups" && (
          <div className="space-y-6" id="cms-backups-section">
            <div>
              <span className="text-xs font-mono text-emerald-500 tracking-wider font-bold block uppercase">// State Insurance</span>
              <h3 className="text-base sm:text-lg font-bold text-white">Content Rollover & Snapshots</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                A non-blocking system shadow-copies your site database automatically before every content publish effort. Restore past checkpoints instantly or purge old states.
              </p>
            </div>

            {backupsStatus.message && (
              <div className={`p-4 rounded-xl flex items-center space-x-2.5 border ${
                backupsStatus.type === "success" 
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : "bg-red-950/20 border-red-500/30 text-red-300"
              }`} id="backups-alert-banner">
                {backupsStatus.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                <span className="text-sm font-sans">{backupsStatus.message}</span>
              </div>
            )}

            {isBackupLoading ? (
              <div className="flex justify-center items-center py-12" id="backups-loading-indicator">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : backups.length === 0 ? (
              <div className="border border-dashed border-gray-800 rounded-2xl p-8 text-center text-gray-500 font-sans" id="backups-empty-container">
                <History className="h-8 w-8 mx-auto text-gray-600 mb-2" />
                <p className="text-sm font-medium">No system backups found</p>
                <p className="text-xs text-gray-600 mt-1">Backups are automatically triggered when CMS content is successfully published.</p>
              </div>
            ) : (
              <div className="overflow-x-auto" id="backups-list-table">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-400 font-mono text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4 font-medium">Snapshot Filename</th>
                      <th className="py-3 px-4 font-medium">Created Timestamp</th>
                      <th className="py-3 px-4 font-medium">Size</th>
                      <th className="py-3 px-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 font-sans">
                    {backups.map((bak) => (
                      <tr key={bak.filename} className="hover:bg-gray-900/20 transition-colors">
                        <td className="py-4 px-4 font-mono text-emerald-400 font-medium whitespace-nowrap">
                          {bak.filename.replace(/^content-pre-restore-/, "FALLBACK (").replace(/\.json$/, bak.filename.includes("pre-restore") ? ")" : "")}
                        </td>
                        <td className="py-4 px-4 text-gray-300 whitespace-nowrap">
                          {new Date(bak.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-4 text-gray-400 font-mono whitespace-nowrap">
                          {bak.size}
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleRestoreBackup(bak.filename)}
                              className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/25 hover:bg-emerald-500 hover:text-black font-semibold text-xs text-emerald-400 transition-all"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handleDeleteBackup(bak.filename)}
                              className="p-1.5 rounded-lg border border-red-500/20 bg-red-950/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Snapshot"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: SYSTEM DIAGNOSTICS & HARDWARE METRICS */}
        {activeSubTab === "system" && (
          <div className="space-y-6" id="cms-system-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-emerald-500 tracking-wider font-bold block uppercase">// Container Telemetry</span>
                <h3 className="text-base sm:text-lg font-bold text-white">Sovereign Performance Insights</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">
                  Active server runtime telemetry and container status, fed directly from native system controllers.
                </p>
              </div>
              <button
                onClick={fetchSystemMetrics}
                className="px-4 py-2 border border-gray-800 hover:border-gray-700 bg-brand-bg rounded-lg text-xs font-semibold hover:text-white transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Refresh Monitor</span>
              </button>
            </div>

            {isMetricsLoading || !systemMetrics ? (
              <div className="flex justify-center items-center py-12" id="metrics-loading-indicator">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : (
              <div className="space-y-6" id="metrics-dashboard-view">
                
                {/* Metrics Stats Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Card 1: Server Uptime */}
                  <div className="p-5 rounded-2xl bg-[#090f19] border border-gray-800/80 space-y-2">
                    <p className="text-xs font-mono text-gray-400 font-medium">Service Uptime</p>
                    <p className="text-2xl font-bold font-sans text-emerald-400 tracking-tight">{systemMetrics.uptime}</p>
                    <p className="text-[10px] font-mono text-gray-600">Continuous operation cycle</p>
                  </div>

                  {/* Card 2: Memory Allocated */}
                  <div className="p-5 rounded-2xl bg-[#090f19] border border-gray-800/80 space-y-2">
                    <p className="text-xs font-mono text-gray-400 font-medium">Server Memory Load</p>
                    <p className="text-2xl font-bold font-sans text-white tracking-tight">{systemMetrics.memoryPercent}</p>
                    <p className="text-[10px] font-mono text-gray-500">
                      Used: {(parseFloat(systemMetrics.memoryTotal) - parseFloat(systemMetrics.memoryFree)).toFixed(2)} GB / {systemMetrics.memoryTotal}
                    </p>
                  </div>

                  {/* Card 3: Node RSS */}
                  <div className="p-5 rounded-2xl bg-[#090f19] border border-gray-800/80 space-y-2">
                    <p className="text-xs font-mono text-gray-400 font-medium">Node.js Process RSS</p>
                    <p className="text-2xl font-bold font-sans text-white tracking-tight">{systemMetrics.processMemory}</p>
                    <p className="text-[10px] font-mono text-gray-600">Resident memory allocations</p>
                  </div>

                  {/* Card 4: Database Footprint */}
                  <div className="p-5 rounded-2xl bg-[#090f19] border border-gray-800/80 space-y-2">
                    <p className="text-xs font-mono text-gray-400 font-medium">JSON Database Sizing</p>
                    <p className="text-2xl font-bold font-sans text-white tracking-tight">{systemMetrics.dbSizeFormatted}</p>
                    <p className="text-[10px] font-mono text-gray-500">Persistence storage volume</p>
                  </div>

                </div>

                {/* Container Specifications Sub-Panel */}
                <div className="rounded-2xl border border-gray-800/80 bg-[#090f19] p-5 sm:p-6 space-y-4">
                  <h4 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    <span>Host Architecture & Container Specs</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs sm:text-sm font-sans border-t border-gray-800 pt-4">
                    <div className="flex justify-between py-1.5 border-b border-gray-800/40 border-dashed">
                      <span className="text-gray-400">Operating System Platform</span>
                      <span className="font-mono text-white font-medium">{systemMetrics.platform} ({systemMetrics.arch})</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-800/40 border-dashed">
                      <span className="text-gray-400">Node Engine Version</span>
                      <span className="font-mono text-white font-medium">{systemMetrics.nodeVersion}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-800/40 border-dashed">
                      <span className="text-gray-400">Total Virtual Cryptocells</span>
                      <span className="font-mono text-emerald-400 font-medium">{systemMetrics.cpuCount} vCPUs</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-800/40 border-dashed">
                      <span className="text-gray-400">System CPU Model</span>
                      <span className="text-white truncate max-w-[200px] sm:max-w-none text-right font-mono text-xs" title={systemMetrics.cpuModel}>{systemMetrics.cpuModel}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-800/40 border-dashed">
                      <span className="text-gray-400">Product Assets Uploaded</span>
                      <span className="font-mono text-white font-medium">{systemMetrics.uploadCount} assets</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-800/40 border-dashed">
                      <span className="text-gray-400">Active Media Assets Weight</span>
                      <span className="font-mono text-white font-medium">{systemMetrics.uploadSizeFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Secure Active Backup Downloads Panel */}
                <div className="rounded-2xl border border-gray-800/80 bg-[#090f19] p-5 sm:p-6 space-y-4" id="secure-backups-downloader-panel">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      <span>Local Secure Core Downloader</span>
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-500/10 uppercase tracking-tight">Active API Tunnel</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    If your IDE experiences dynamic synchronization delays or is unable to download files directly, you can retrieve your live sovereign content database (`content.json`), secure administrator hashes (`users.json`), and dependency locks (`package-lock.json`) directly from your running container below:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                    <button
                      onClick={() => downloadSystemFile("content.json")}
                      className="flex items-center justify-between p-3.5 bg-gray-950/40 hover:bg-emerald-950/20 border border-gray-800 hover:border-emerald-500/30 rounded-xl group transition-all text-left"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors block">content.json</span>
                        <span className="text-[10px] text-gray-500 font-mono">CMS DB ({systemMetrics.dbSizeFormatted})</span>
                      </div>
                      <Download className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-all shrink-0 ml-2" />
                    </button>

                    <button
                      onClick={() => downloadSystemFile("users.json")}
                      className="flex items-center justify-between p-3.5 bg-gray-950/40 hover:bg-emerald-950/20 border border-gray-800 hover:border-emerald-500/30 rounded-xl group transition-all text-left"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors block">users.json</span>
                        <span className="text-[10px] text-gray-500 font-mono">Admin Hashes</span>
                      </div>
                      <Download className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-all shrink-0 ml-2" />
                    </button>

                    <button
                      onClick={() => downloadSystemFile("package-lock.json")}
                      className="flex items-center justify-between p-3.5 bg-gray-950/40 hover:bg-emerald-950/20 border border-gray-800 hover:border-emerald-500/30 rounded-xl group transition-all text-left"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-gray-200 group-hover:text-emerald-400 transition-colors block">package-lock.json</span>
                        <span className="text-[10px] text-gray-500 font-mono">Dependency Lock</span>
                      </div>
                      <Download className="h-4 w-4 text-gray-500 group-hover:text-emerald-400 transition-all shrink-0 ml-2" />
                    </button>
                  </div>
                </div>

                {/* Storage Health Gauge (Mock/Visual indicator of robust cloud storage readiness) */}
                <div className="rounded-2xl border border-gray-800/80 bg-green-950/5 p-5 text-xs sm:text-sm text-gray-400 space-y-2">
                  <p className="font-semibold text-white flex items-center space-x-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    <span>Persistence Storage Reliability Status</span>
                  </p>
                  <p className="leading-relaxed text-xs">
                    Sovereign content persistence operates out of transactional state structures. File system logs are stored inside high-efficiency local structures paired with a hot memory cache. Real-time updates automatically replicate safely to localized databases with zero downtime.
                  </p>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
