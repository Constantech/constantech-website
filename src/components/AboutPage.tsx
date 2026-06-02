import React from "react";
import { 
  Check, 
  ArrowRight, 
  Settings, 
  Smartphone, 
  Network, 
  Award, 
  History, 
  Heart,
  Quote
} from "lucide-react";
import { AboutPageContent } from "../types";

interface AboutPageProps {
  data: AboutPageContent;
}

const getAboutIcon = (icon: string) => {
  switch (icon) {
    case "settings_input_component":
      return <Settings className="h-5 w-5 text-green-400" />;
    case "devices":
      return <Smartphone className="h-5 w-5 text-emerald-400" />;
    case "hub":
      return <Network className="h-5 w-5 text-blue-400" />;
    default:
      return <Award className="h-5 w-5 text-yellow-400" />;
  }
};

export const AboutPage: React.FC<AboutPageProps> = ({ data }) => {
  return (
    <div className="space-y-20 py-12 lg:py-20" id="aboutpage-root">
      
      {/* 1. HERO BIO HEADER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="about-hero">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            {data.heroBadge && (
              <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-mono text-emerald-400">
                <span>◆ {data.heroBadge}</span>
              </span>
            )}
            
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {data.heroTitle || "Precision Architecture. Human-Centric AI."}
            </h1>
            
            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
              {data.heroSubtitle || "The journey of Constantech began at the turn of the millennium. For over two decades, we've evolved alongside the technological landscape, maturing from a local hardware provider into a powerhouse of digital transformation."}
            </p>

            {/* Micro strategic stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800/60" id="about-hero-stats">
              {(data.heroStats || []).map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="font-display text-2xl sm:text-3xl font-bold text-green-light">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-sans leading-normal">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
              <img 
                src={data.heroImg} 
                alt="Millennium Evolution Headquarters" 
                className="w-full aspect-[4/3] object-cover filter brightness-95 group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {data.heroQuote && (
                <div className="absolute bottom-6 left-6 font-mono text-xs text-emerald-300 bg-black/70 backdrop-blur-md border border-gray-800 px-3.5 py-1.5 rounded-lg flex items-center space-x-2">
                  <History className="h-3.5 w-3.5" />
                  <span>{data.heroQuote}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 2. THE 2013 CRUCIAL PIVOT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="about-pivot">
        <div className="rounded-3xl border border-gray-800/80 bg-gradient-to-r from-gray-900 via-[#0a0f18] to-gray-900 p-8 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left Block */}
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-mono px-2.5 py-1 rounded">
                <span>{data.pivotYearTitle || "The 2013 Pivot"}</span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed font-sans">
                {data.pivotYearDesc || "In 2013, we recognized a fundamental shift in how businesses interact with technology. We rebranded to Constantech to signal our commitment to becoming a pure technology partner, focusing on the software and infrastructure that drives modern enterprise."}
              </p>
              <div className="pt-2 flex items-center space-x-2 text-xs text-gray-500 font-mono">
                <History className="h-4 w-4 text-emerald-500" />
                <span>{data.pivotYearIconText || "Refined Strategic Vision"}</span>
              </div>
            </div>

            {/* Right Block */}
            <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-gray-800/80 pt-6 lg:pt-0 lg:pl-12">
              <span className="text-xs font-mono text-emerald-500 tracking-wider font-bold block uppercase">
                // {data.pivotRightBadge || "EVOLUTION"}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {data.pivotRightTitle || "Reflecting a Modern Tech Focus"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                {data.pivotRightDesc || "Constantech isn't just a name; it's our promise of constant innovation and technical stability. We moved beyond being a supplier to becoming an architect of digital solutions."}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. EXPERIENCE TRACK: WHAT WE HAVE DONE (BENTO BOX GRID) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="about-bento">
        <div className="mb-12 text-center md:text-left">
          <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">// Historical Footprint</span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white mt-1">
            {data.bentoTitle || "What We Have Done"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="bento-grid">
          {/* Card list - 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            {(data.bentoCards || []).map((card) => (
              <div 
                key={card.id} 
                className="p-5 rounded-2xl border border-gray-800/60 bg-[#090f19] hover:border-emerald-500/20 transition-all duration-300"
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-950 border border-gray-800">
                    {getAboutIcon(card.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-white font-sans">{card.title}</h4>
                    <p className="mt-1 text-xs text-gray-400 font-sans leading-relaxed">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Picture banner - 7 cols */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="relative group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-xl h-full flex">
              <img 
                src={data.bentoImg} 
                alt="Decoupled Blueprint Setup" 
                className="w-full h-full object-cover filter brightness-90 group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              {data.bentoImgCaption && (
                <div className="absolute bottom-4 left-4 text-[11px] font-mono text-gray-300 bg-brand-bg/85 px-3 py-1.5 rounded border border-gray-800 backdrop-blur-sm">
                  ⚡ {data.bentoImgCaption}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHERE WE ARE NOW (AI REVOLUTION IMMERSION) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="about-current">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Image Block (Left) */}
          <div className="lg:col-span-6">
            <div className="relative group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
              <img 
                src={data.currentImg} 
                alt="Constantech AI systems labs" 
                className="w-full aspect-square md:aspect-[4/3] object-cover filter brightness-95 group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Content Block (Right) */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">{data.currentTitle || "Where We Are Now"}</span>
            <h2 className="font-display text-3xl font-bold text-white tracking-tight leading-tight">
              {data.currentSubtitle || "Deeply Immersed in AI."}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
              {data.currentDesc || "Today, Constantech stands at the forefront of the artificial intelligence revolution. We are integrating advanced machine learning and LLMs into every layer of our client interfaces, ensuring that the software we build isn't just functional, but autonomous and intelligent."}
            </p>

            <ul className="space-y-3 pt-2" id="current-points">
              {(data.currentHighlights || []).map((pt, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-gray-300">
                  <div className="flex-shrink-0 mt-0.5 rounded-full bg-emerald-950 p-1 border border-emerald-500/20">
                    <Check className="h-3 w-3 text-green-light" />
                  </div>
                  <span className="font-sans leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* 5. PHILOSOPHY HIGHLIGHT BIG CALLOUT */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center py-8" id="about-philosophy">
        <div className="relative rounded-2xl bg-[#090e16] p-8 sm:p-12 md:p-16 border border-emerald-500/10 hover:border-emerald-500/20 transition-colors shadow-2xl">
          <div className="absolute top-4 left-6 text-7xl font-serif text-emerald-900/10 pointer-events-none select-none">
            “
          </div>
          <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl italic font-bold tracking-tight text-white max-w-3xl mx-auto leading-relaxed relative z-10">
            {data.philosophyBigQuote || '"We want every client, to feel like our only client"'}
          </blockquote>
          <div className="flex justify-center items-center space-x-2 mt-6">
            <Heart className="h-4 w-4 text-pink-500 shrink-0" />
            <p className="text-xs sm:text-sm font-mono text-gray-400 max-w-xl mx-auto leading-relaxed">
              {data.philosophyDesc || "Our philosophy is built on human-centric technology. Behind every line of code and every server rack is a dedicated partner committed to solving your unique pain points with agile precision."}
            </p>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION DETAILS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="about-cta">
        <div className="rounded-3xl border border-gray-800 bg-[#06101c]/40 p-8 sm:p-12 md:p-16 text-center space-y-6 shadow-xl">
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
            {data.ctaTitle || "Build the Future with Us"}
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
            {data.ctaSubtitle || "We are constantly seeking talented individuals who share our passion for technical precision and human-centric design. Ready to join the Constantech evolution?"}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {data.ctaBtn1?.text && (
              <a
                href={data.ctaBtn1.link || "#"}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm text-black bg-green-light hover:bg-emerald-400 shadow-md shadow-emerald-500/5 transition-all"
              >
                {data.ctaBtn1.text}
              </a>
            )}
            {data.ctaBtn2?.text && (
              <a
                href={data.ctaBtn2.link || "#"}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm text-white bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white transition-all"
              >
                {data.ctaBtn2.text}
              </a>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
