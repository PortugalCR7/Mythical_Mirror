import React, { useEffect, useState } from 'react';
import { AppState } from '../services/types';
import { Sparkles, Compass, Eye, Zap } from 'lucide-react';

interface Props {
  state: AppState;
  message?: string;
}

const LoadingOracle: React.FC<Props> = ({ state }) => {
  const [dots, setDots] = useState('');

  // Ritualistic cycling of dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Map the technical state to mythic language
  const getRitualText = () => {
    switch (state) {
      case AppState.ANALYZING:
        return {
          title: "Scanning Cosmic Fingerprint",
          subtitle: "Mapping your alignment with the celestial grid",
          icon: <Compass className="animate-spin-slow text-gold" size={48} />
        };
      case AppState.COMMUNING:
        return {
          title: "Inquiry Sent to the Vault",
          subtitle: "The Oracle is consulting the 300 Archetypes",
          icon: <Eye className="animate-pulse text-lavenderPurple" size={48} />
        };
      case AppState.MANIFESTING:
        return {
          title: "Manifesting Identity",
          subtitle: "Weaving lore into the fabric of your reveal",
          icon: <Zap className="animate-bounce text-gold" size={48} />
        };
      default:
        return {
          title: "The Mirror is Awakening",
          subtitle: "Preparing the ritual space",
          icon: <Sparkles className="text-white opacity-50" size={48} />
        };
    }
  };

  const ritual = getRitualText();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12 animate-fade-in">
      {/* THE CENTRAL ICON */}
      <div className="relative">
        <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full animate-pulse-slow" />
        <div className="relative p-8 border border-gold/10 rounded-full bg-black/40 backdrop-blur-sm">
          {ritual.icon}
        </div>
      </div>

      {/* THE TEXTUAL PROGRESS */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-serif text-gold uppercase tracking-[0.2em] animate-pulse">
          {ritual.title}{dots}
        </h2>
        <p className="text-lavenderPurple font-light italic tracking-widest max-w-xs mx-auto opacity-70">
          {ritual.subtitle}
        </p>
      </div>

      {/* THE ENERGY BAR */}
      <div className="w-64 h-[1px] bg-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-gold animate-progress-flow w-full" />
      </div>

      {/* DYNAMIC SYSTEM LOGS (Subtle bottom feedback) */}
      <div className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter fixed bottom-12">
        Oracle Signal: Stable // Model: Gemini 2.0 Flash // Vault: 300_ARCHETYPES_ACTIVE
      </div>
    </div>
  );
};

export default LoadingOracle;