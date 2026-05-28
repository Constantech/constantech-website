import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { ConstantechLogo } from "./ConstantechLogo";

interface FooterProps {
  logoText: string;
  footerTagline: string;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ logoText, footerTagline, setActiveTab }) => {
  return (
    <footer className="border-t border-gray-800/80 bg-[#060a10] text-gray-400 py-12" id="footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2" id="footer-logo">
              <ConstantechLogo className="h-7 w-7" />
              <span className="font-display text-lg font-bold tracking-tight text-white">
                {logoText || "Constantech"}
              </span>
            </div>
            <p className="max-w-md text-sm text-gray-400 leading-relaxed font-sans">
              {footerTagline || "Building the digital backbone for sovereign enterprises. Precision-engineered applications for a decoupled future."}
            </p>
            <div className="pt-2 text-xs text-gray-500 font-mono">
              Designed dynamically with sandboxed state persistence.
            </div>
          </div>

          {/* Quick Nav Options */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono tracking-widest text-emerald-400 uppercase">Architectures</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <button 
                  onClick={() => setActiveTab("home")} 
                  className="hover:text-emerald-300 hover:underline transition-colors"
                >
                  AI For People & Business
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab("webdev")} 
                  className="hover:text-emerald-300 hover:underline transition-colors"
                >
                  Sovereign Engineering
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveTab("about")} 
                  className="hover:text-emerald-300 hover:underline transition-colors"
                >
                  Millennium Evolution
                </button>
              </li>
            </ul>
          </div>

          {/* Contact and Headquarters info */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono tracking-widest text-emerald-400 uppercase">Headquarters</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-gray-300 font-sans">London, United Kingdom</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-gray-400 font-mono">precision@constantech.io</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span className="text-gray-400 font-mono">+44 20 7946 0192</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Constantech. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="hover:text-gray-400 transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-400 transition-colors">Security Rules</span>
            <span>•</span>
            <span className="hover:text-gray-400 transition-colors">Data Sovereignty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
