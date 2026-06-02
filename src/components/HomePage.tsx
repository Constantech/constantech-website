import React from "react";
import { 
  Check, 
  ArrowRight, 
  TrendingUp, 
  Brain, 
  Users, 
  Lightbulb,
  Zap
} from "lucide-react";
import { HomePageContent } from "../types";

interface HomePageProps {
  data: HomePageContent;
  onNavigateToCMS?: () => void;
}

// Map simple string IDs to Lucide components
const getIconComponent = (icon: string) => {
  switch (icon) {
    case "analytics":
      return <TrendingUp className="h-6 w-6 text-green-400" />;
    case "psychology":
      return <Brain className="h-6 w-6 text-emerald-400" />;
    case "groups":
      return <Users className="h-6 w-6 text-teal-400" />;
    case "lightbulb":
      return <Lightbulb className="h-6 w-6 text-yellow-400" />;
    default:
      return <Zap className="h-6 w-6 text-green-400" />;
  }
};

export const HomePage: React.FC<HomePageProps> = ({ data, onNavigateToCMS }) => {
  return (
    <div className="space-y-16 py-12 lg:py-20" id="homepage-root">
      
      {/* 1. HERO HEADER SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8" id="home-hero">
        {data.heroBadge && (
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs sm:text-sm font-mono text-emerald-400 animate-pulse">
            <span>◆ {data.heroBadge}</span>
          </div>
        )}
        
        <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] text-balance">
          {data.heroTitle || "AI For People In Business"}
        </h1>
        
        <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-gray-400 font-sans leading-relaxed">
          {data.heroSubtitle || "Solving Pain Points — Harness the power of AI to keep your business competitive in a rapidly evolving digital landscape."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {data.heroBtn1?.text && (
            <a
              href={data.heroBtn1.link || "#"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-black bg-green-light hover:bg-emerald-400 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all duration-200"
            >
              {data.heroBtn1.text}
            </a>
          )}
          {data.heroBtn2?.text && (
            <a
              href={data.heroBtn2.link || "#"}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm text-white bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-200"
            >
              {data.heroBtn2.text}
            </a>
          )}
        </div>
      </section>

      {/* 2. REVOLUTIONISE SECTION (SERVICE 1) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12" id="home-service-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Content Block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="text-xs font-mono tracking-widest text-emerald-500 uppercase">
              // Core Opportunity
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              {data.service1Title || "Revolutionise Your Business With AI"}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
              {data.service1Desc || "Our deep expertise identifies untapped AI opportunities within your current workflow, turning complexity into a competitive advantage."}
            </p>

            <ul className="space-y-3 pt-2" id="service1-points">
              {(data.service1Checkpoints || []).map((point, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-sm text-gray-300">
                  <div className="flex-shrink-0 mt-0.5 rounded-full bg-emerald-950 p-1 border border-emerald-500/20">
                    <Check className="h-3 w-3 text-green-light" />
                  </div>
                  <span className="font-sans leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Block */}
          <div className="lg:col-span-7">
            <div className="relative group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
              <img 
                src={data.service1Img} 
                alt="AI Platform Opportunity" 
                className="w-full aspect-[16/10] object-cover filter brightness-95 contrast-105 group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
              <div className="absolute bottom-4 left-4 inline-flex items-center space-x-1 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-800 text-[10px] font-mono text-emerald-400">
                <span>Active Model Mapping</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. UNDENIABLE REALITY BANNER (SERVICE 2) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-service-2">
        <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/60 to-gray-950/80 p-8 sm:p-12 shadow-xl hover:border-gray-700/60 transition-all duration-300">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">// Strategic Outlook</span>
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              {data.service2Title || "The Undeniable Reality That AI Is Here To Stay"}
            </h3>
            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
              {data.service2Desc || "Future-proof your operations with proven frameworks and robust risk management designed for the sovereign enterprise."}
            </p>
            {data.service2LinkText && (
              <div className="pt-2">
                <a 
                  href="#"
                  className="inline-flex items-center space-x-2 text-green-light hover:text-emerald-400 font-medium text-sm transition-colors group"
                >
                  <span>{data.service2LinkText}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. GAME CHANGER & STATS VIEW (SERVICE 3) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-service-3">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Block (Left) */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative group overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">
              <img 
                src={data.service3Img} 
                alt="AI Platform Augmentation" 
                className="w-full aspect-[4/3] object-cover filter brightness-90 group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 pointer-events-none" />
            </div>
          </div>

          {/* Content Block (Right) */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div className="text-xs font-mono tracking-widest text-emerald-500 uppercase">
              // Objective Decoupling
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              {data.service3Title || "AI Is A Game Changer"}
            </h2>
            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed">
              {data.service3Desc || "We provide an objective perspective combined with innovative solutions that move the needle. This isn't just about automation; it's about augmentation."}
            </p>

            {/* Strategic Stats */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-4" id="service3-stats">
              {(data.service3Stats || []).map((stat, idx) => (
                <div key={idx} className="rounded-xl border border-gray-800/80 bg-gray-950/50 p-4 sm:p-5 hover:border-emerald-950 hover:bg-gray-950/80 transition-colors">
                  <div className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-green-light">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs sm:text-sm text-gray-400 font-sans leading-normal">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. MORE REASONS TO LOVE OUR SERVICES (BENTO GRID) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-grid-section">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">// Exceptional Delivery</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            {data.gridTitle || "More Reasons To Love Our Services"}
          </h2>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed font-sans">
            {data.gridSubtitle || "Precision-engineered solutions tailored for the high-performance modern enterprise."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="home-bento-grid">
          {(data.gridCards || []).map((card) => (
            <div 
              key={card.id} 
              className="flex flex-col justify-between rounded-2xl border border-gray-800/80 bg-gradient-to-b from-gray-900/40 to-gray-950/60 p-6 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-950/10 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-950 border border-gray-800">
                  {getIconComponent(card.icon)}
                </div>
                <div>
                  <h4 className="font-display text-lg font-bold text-white tracking-tight">
                    {card.title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. REAL TESTIMONIALS SLIDER / GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" id="home-testimonials">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono tracking-widest text-emerald-500 uppercase">// Peer Endorsement</span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white">
            What Our Partners Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="home-testimonials-grid">
          {(data.testimonials || []).map((item) => (
            <div 
              key={item.id} 
              className="flex flex-col justify-between rounded-2xl border border-gray-800/85 bg-[#090e15]/90 p-6 sm:p-8 hover:border-emerald-950 transition-all duration-300 relative"
            >
              {/* Giant quote mark element */}
              <div className="absolute top-4 right-6 text-6xl font-serif text-emerald-900/10 select-none pointer-events-none">
                “
              </div>
              
              <div className="space-y-4">
                <p className="text-sm sm:text-base italic text-gray-300 leading-relaxed font-sans relative z-10">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center space-x-3.5 pt-6 border-t border-gray-800/40 mt-6 md:mt-8">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-800">
                  <img 
                    src={item.avatarUrl} 
                    alt={item.author} 
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white font-sans">
                    {item.author}
                  </div>
                  <div className="text-xs text-gray-500 font-mono font-medium">
                    {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
