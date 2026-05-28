import React from "react";
import { 
  Cpu, 
  Database, 
  Terminal, 
  GitPullRequest, 
  Cloud, 
  Check, 
  Braces, 
  Box, 
  HardDrive 
} from "lucide-react";
import { WebDevPageContent } from "../types";

interface WebDevPageProps {
  data: WebDevPageContent;
}

const getWebIcon = (icon: string) => {
  switch (icon) {
    case "database":
      return <Database className="h-6 w-6 text-green-400" />;
    case "data_object":
      return <Braces className="h-6 w-6 text-emerald-400" />;
    case "box":
      return <Box className="h-6 w-6 text-blue-400" />;
    case "rebase":
      return <GitPullRequest className="h-6 w-6 text-teal-400" />;
    case "cloud_done":
      return <Cloud className="h-6 w-6 text-emerald-400" />;
    default:
      return <HardDrive className="h-6 w-6 text-gray-400" />;
  }
};

export const WebDevPage: React.FC<WebDevPageProps> = ({ data }) => {
  return (
    <div className="space-y-20 py-12 lg:py-20" id="webdev-root">
      
      {/* 1. HERO REBUILD */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8" id="webdev-hero">
        {data.heroBadge && (
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs sm:text-sm font-mono text-emerald-400">
            <span>◇ {data.heroBadge}</span>
          </div>
        )}
        
        <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.15] text-balance">
          {data.heroTitle || "How Our Modern Applications Are Built: A Decoupled, Agile, and Sovereign Blueprint"}
        </h1>
        
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-gray-400 font-sans leading-relaxed">
          {data.heroSubtitle || "We don't just build websites. We engineer modular, high-performance ecosystems using a \"Sandboxed Architecture\" philosophy that prioritizes data sovereignty and technical precision."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {data.heroBtn1?.text && (
            <a
              href={data.heroBtn1.link || "#"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-green-light to-emerald-400 cursor-pointer hover:brightness-105 shadow-md shadow-emerald-500/10 transition-all duration-200"
            >
              {data.heroBtn1.text}
            </a>
          )}
          {data.heroBtn2?.text && (
            <a
              href={data.heroBtn2.link || "#"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gray-905 border border-gray-800 hover:bg-gray-800 transition-all duration-200"
            >
              {data.heroBtn2.text}
            </a>
          )}
        </div>
      </section>

      {/* 2. CHOSEN SUBSECTION: CLIENT & SERVER LAYER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12" id="webdev-section-1">
        <div className="text-center md:text-left space-y-2 mb-12">
          <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">{data.section1Title || "01. Client & Server Layer"}</span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            {data.section1Subtitle || "Decoupled Full-Stack Architecture"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="client-server-grid">
          {/* Client Side Card */}
          <div className="rounded-2xl border border-gray-800 bg-[#090f19] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                  {data.section1ClientTitle || "TypeScript/React Client Layer"}
                </h3>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                {data.section1ClientDesc || "Our frontend is a sandboxed, type-safe environment that ensures zero runtime errors and ultra-fast paint times through optimized component life-cycles."}
              </p>

              <ul className="space-y-2.5 pt-2">
                {(data.section1ClientCheckpoints || []).map((pt, idx) => (
                  <li key={idx} className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
                    <Check className="h-4 w-4 text-green-light shrink-0" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800/60 font-mono text-[10px]">
              {(data.section1ClientTags || []).map((tg, idx) => (
                <span key={idx} className="bg-emerald-950/40 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/10">
                  {tg}
                </span>
              ))}
            </div>
          </div>

          {/* Server-Side Card */}
          <div className="rounded-2xl border border-gray-800 bg-[#090f19] p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-400">
                  <Terminal className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-white">
                  {data.section1ServerTitle || "NodeJS/Express Backend"}
                </h3>
              </div>

              <p className="text-sm text-gray-400 leading-relaxed font-sans">
                {data.section1ServerDesc || "A lightweight yet powerful orchestration layer designed for high concurrency and low-latency API brokerage."}
              </p>

              {/* Server terminal simulation */}
              <div className="bg-black/80 rounded-xl border border-gray-800 p-4 font-mono text-xs text-gray-400 space-y-1.5 shadow-inner">
                <div className="text-emerald-500 flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>online @ port 3000</span>
                </div>
                <div>$ npm run build:server</div>
                <div className="text-gray-500">&gt; esbuild server.ts --bundle --platform=node</div>
                <div className="text-green-400">✔ dist/server.cjs generated (341KB)</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-800/60 font-mono text-xs text-emerald-400">
              <span>Security Brokerage Ready</span>
              <span>{data.section1ServerStats || "API Integrity: 99.9%"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PERSISTENCE LAYER: HYBRID STORAGE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="webdev-section-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Block (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">{data.section2Title || "02. Data Layer"}</span>
            <h2 className="font-display text-3xl font-bold text-white tracking-tight leading-tight">
              {data.section2Subtitle || "Hybrid Persistence & Local Schema Autonomy"}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
              {data.section2Desc || "We implement a \"Dual-Track\" data strategy. Critical business logic stays in robust PostgreSQL environments, while application state and fast-access caches reside in sovereign JSON stores."}
            </p>

            <div className="space-y-4 pt-4" id="data-layer-subs">
              {(data.section2Features || []).map((f) => (
                <div key={f.id} className="flex gap-4 p-4 rounded-xl border border-gray-800/60 bg-gray-950/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-950/60 border border-emerald-500/20">
                    {getWebIcon(f.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white font-sans">{f.title}</h4>
                    <p className="mt-1 text-xs text-gray-400 font-sans leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Block with Floating Status Node */}
          <div className="lg:col-span-7">
            <div className="relative group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
              <img 
                src={data.section2Img} 
                alt="System Persistence Grid" 
                className="w-full aspect-[16/10] object-cover filter brightness-90 group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Floating tech node */}
              <div className="absolute top-4 right-4 bg-[#090f19]/90 border border-gray-700/60 rounded-xl p-3 shadow-xl backdrop-blur-md font-mono text-[10px] space-y-1">
                <div className="text-gray-400 flex items-center justify-between gap-6">
                  <span>Engine:</span>
                  <span className="text-green-light font-bold">{data.section2FloatingStatus || "Active Persistence"}</span>
                </div>
                <div className="text-gray-500 flex items-center justify-between">
                  <span>Ping Speed:</span>
                  <span>{data.section2FloatingLatency || "Latency: < 2ms"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. REBUILD CONTINUOUS DEPLOYMENT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="webdev-section-3">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">{data.section3Title || "03. Deployment Pipeline"}</span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white">
            {data.section3Subtitle || "Continuous Integration & Production Containers"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="pipeline-cards">
          {(data.section3Cards || []).map((card, idx) => (
            <div 
              key={card.id || idx} 
              className="rounded-2xl border border-gray-800 bg-[#06101c]/50 p-6 sm:p-8 space-y-4 hover:border-emerald-950/80 hover:bg-[#06101c]/80 transition-all duration-300 relative"
            >
              <div className="absolute top-6 right-6 text-2xl font-mono text-emerald-500/10 font-bold">
                0{idx + 1}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-950/40 border border-emerald-500/15">
                {getWebIcon(card.icon)}
              </div>
              <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight pt-1">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. NEXT-GEN SECURE CONTEXT-AWARE AI */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="webdev-section-4">
        <div className="rounded-3xl border border-emerald-500/10 bg-gradient-to-br from-emerald-950/10 to-[#071322] p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          {/* Subtle green ambient light overlay */}
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center space-x-1 border border-emerald-500/35 bg-emerald-950/30 text-green-light px-2.5 py-1 rounded text-[10px] font-mono uppercase">
                ⚡ {data.section4Title || "NEXT-GEN INTERFACES"}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                {data.section4Subtitle || "Secure, Context-Aware AI Integrations"}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed">
                {data.section4Desc || "We leverage the Google GenAI SDK with a strict server-side brokerage pattern. This ensures your proprietary data never leaks into training sets—true zero-telemetry AI for the enterprise."}
              </p>
            </div>

            <div className="lg:col-span-5 flex flex-wrap gap-3">
              {(data.section4Features || []).map((feat, idx) => (
                <div key={idx} className="flex-1 min-w-[150px] bg-emerald-950/20 border border-emerald-500/10 rounded-xl p-4 text-center font-mono hover:border-green-light/20 transition-all">
                  <div className="h-2 w-2 rounded-full bg-green-light mx-auto mb-2 animate-ping" />
                  <span className="text-sm text-emerald-300 font-semibold">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
