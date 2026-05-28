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
  Info, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle,
  HardDrive
} from "lucide-react";
import { SiteContent, MediaAsset } from "../types";

interface AdminPanelProps {
  token: string;
  siteContent: SiteContent;
  onContentSaved: (updatedContent: SiteContent) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ token, siteContent, onContentSaved }) => {
  // Navigation for Admin Panel Tabs
  const [activeSubTab, setActiveSubTab] = useState<"home" | "webdev" | "about" | "global" | "media" | "security">("home");
  
  // Local Copy of Site Content for modification before saving
  const [localContent, setLocalContent] = useState<SiteContent>({ ...siteContent });
  
  // Media asset list and upload states
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error" | "loading" | null, message: string }>({ type: null, message: "" });
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Security Form state
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

  // Overall saving indicator
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null, message: string }>({ type: null, message: "" });

  // Sync state if siteContent updates from parent
  useEffect(() => {
    setLocalContent({ ...siteContent });
  }, [siteContent]);

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
        {activeSubTab !== "media" && activeSubTab !== "security" && (
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

      </div>
    </div>
  );
};
