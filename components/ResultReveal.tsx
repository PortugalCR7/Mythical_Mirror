import './ResultReveal.css';
import React from 'react';
import { OracleResult } from '../services/types';
import { RefreshCcw, Download, Zap, Activity, Globe, Shield, Share2 } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import ShareCard, { ShareLayout } from './ShareCard';

interface Props {
  result: OracleResult;
  onReset: () => void;
}

const ResultReveal: React.FC<Props> = ({ result, onReset }) => {
  const [viewState, setViewState] = React.useState<'SCRIPTURE' | 'MANIFESTATION'>('SCRIPTURE');
  const shareRef = React.useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = React.useState(false);
  const [layout, setLayout] = React.useState<ShareLayout>('descent');

  // Resolve the portrait to a data URL for export. Fresh reveals are already
  // data URLs (no-op); history portraits are cross-origin Supabase signed URLs
  // that would taint the html-to-image canvas, so we fetch + inline them.
  const rawPortrait = result.generatedImage || result.userImage;
  const [exportPortrait, setExportPortrait] = React.useState<string | undefined>(
    rawPortrait?.startsWith('data:') ? rawPortrait : undefined
  );
  React.useEffect(() => {
    if (!rawPortrait || rawPortrait.startsWith('data:')) {
      setExportPortrait(rawPortrait);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(rawPortrait, { mode: 'cors' });
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (!cancelled) setExportPortrait(dataUrl);
      } catch (err) {
        // CORS or network failure — fall back to the raw URL so the in-app
        // preview still displays; export may taint, handled in sharePortrait.
        if (!cancelled) setExportPortrait(rawPortrait);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [rawPortrait]);

  const exportAsImage = async () => {
    const node = document.getElementById('mythic-card');
    if (node) {
      const dataUrl = await toPng(node, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `revelation-${result.id}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const sharePortrait = async () => {
    if (!shareRef.current || sharing) return;
    setSharing(true);
    try {
      // Ensure web fonts are loaded before rasterizing, or text falls back.
      if (document.fonts?.ready) await document.fonts.ready;

      const blob = await toBlob(shareRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor: '#050505',
      });
      if (!blob) throw new Error('Could not render share card.');

      const file = new File([blob], `mythical-mirror-${result.id}.png`, { type: 'image/png' });
      const shareData: ShareData = {
        files: [file],
        title: result.archetype,
        text: `I am ${result.archetype} — divined by The Mythical Mirror.`,
      };

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = file.name;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      // AbortError = user dismissed the native share sheet; not an error.
      if (err?.name !== 'AbortError') console.error('Share failed:', err);
    } finally {
      setSharing(false);
    }
  };

  // SCRIPTURE PHASE (The Descent)
  if (viewState === 'SCRIPTURE') {
    return (
      <div className="mythic-container flex flex-col items-center justify-center min-h-screen animate-fade-in px-4">
        <div className="max-w-3xl text-center">
          <span className="mythic-brief-label mb-4 block animate-stagger-1 text-gold/50 tracking-[0.5em]">The Lost Scripture</span>

          <div className="mythic-scroll animate-stagger-1 mb-12">
            <h1 className="text-3xl md:text-4xl font-cinzel text-gold mb-8">{result.archetype}</h1>
            <p className="text-xl md:text-2xl leading-relaxed text-gray-300 font-serif italic">
              {result.mythopoeticBrief.descent}
            </p>
          </div>

          <button
            onClick={() => setViewState('MANIFESTATION')}
            className="animate-stagger-3 px-10 py-4 border border-gold/40 text-gold hover:bg-gold hover:text-black transition-all duration-500 rounded-sm font-cinzel tracking-[0.2em] uppercase text-sm"
          >
            Enter The Mirror
          </button>
        </div>
      </div>
    );
  }

  // MANIFESTATION PHASE (The Full Dashboard)
  return (
    <div className="mythic-container max-w-5xl mx-auto py-10 px-4 animate-fade-in">
      <div id="mythic-card" className="bg-black border border-gold/20 rounded-2xl overflow-hidden shadow-2xl relative">
        {/* Subtle Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gold/5 blur-[120px]" />

        {/* HEADER: The Archetype Identity (Fade In 1) */}
        <div className="relative p-12 text-center border-b border-gold/10 animate-stagger-1">
          <span className="mythic-brief-label mb-2">
            {result.culture || "Ancient"} Lineage
          </span>

          <h1 className="mythic-title text-5xl md:text-6xl mb-6">
            {result.archetype}
          </h1>

          <p className="text-gold/60 italic tracking-widest text-sm uppercase">
            {result.mythopoeticBrief.one_liner}
          </p>
        </div>

        {/* LOST SCRIPTURE: The Descent (Fade In 1 - Priority) */}
        {/* KEPT FOR CONTEXT IN CARD, BUT REDUCED EMPHASIS IF ALREADY READ */}
        <div className="mythic-scroll max-w-4xl mx-auto animate-stagger-1 opacity-80 scale-95 origin-top">
          <p className="text-lg md:text-xl text-justify text-gray-400 font-serif leading-loose italic">
            {result.mythopoeticBrief.descent}
          </p>
        </div>


        {/* THE MIRROR: Visual Manifestation (Fade In 2) */}
        <div className="relative p-8 flex flex-col items-center justify-center border-b border-gold/10 bg-black animate-stagger-2">
          <div className="mythic-image-frame w-80 h-80 rounded-full border-2 border-gold/30 p-1 bg-black/50 shadow-[0_0_30px_rgba(212,175,55,0.1)] mb-6">
            <img
              /* PRIORITY: Show the synthesized 8K image first, fallback to user headshot */
              src={result.generatedImage || result.userImage}
              alt={result.archetype}
              className="w-full h-full object-cover rounded-full filter grayscale-[30%] contrast-[110%]"
            />
          </div>

          {/* LIKENESS LORE: The Bridge */}
          {result.mythopoeticBrief.likeness_lore && (
            <p className="likeness-covenant text-center max-w-lg mx-auto">
              "{result.mythopoeticBrief.likeness_lore}"
            </p>
          )}
        </div>

        {/* THE RECLAMATION (Fade In 3) */}
        {result.mythopoeticBrief.reclamation && (
          <div className="space-y-4 text-center mt-12 px-12 animate-stagger-3">
            <h4 className="text-gold text-lg uppercase tracking-[0.3em] font-cinzel border-b border-gold/20 pb-2 inline-block">The Reclamation</h4>
            <p className="text-gray-300 leading-relaxed font-serif text-lg">{result.mythopoeticBrief.reclamation}</p>
          </div>
        )}

        {/* THE DEVOTION (Fade In 3) */}
        <div className="space-y-4 text-center mt-12 animate-stagger-3">
          <h4 className="text-gold text-lg uppercase tracking-[0.3em] font-cinzel border-b border-gold/20 pb-2 inline-block">The Devotion</h4>
          <p className="text-gray-400 leading-relaxed font-light">{result.mythopoeticBrief.devotion}</p>
        </div>
      </div>

      {/* THE 10-POINT COSMIC CODE (Fade In 3) */}
      {/* THE 10-POINT COSMIC CODE (Fade In 3) */}
      {/* THE 10-POINT COSMIC CODE (Fade In 3) */}
      <div className="p-12 animate-stagger-3 max-w-3xl mx-auto">
        <h3 className="text-2xl font-cinzel text-gold uppercase tracking-widest mb-12 text-center underline decoration-gold/50 decoration-1 underline-offset-8">Cosmic Code</h3>

        <div className="flex flex-col gap-8 md:gap-12">
          {[
            {
              label: 'Human Design',
              title: result.fingerprint?.humanDesignProfile,
              reading: result.cosmicReadings?.hds
            },
            {
              label: 'Gene Keys',
              title: result.fingerprint?.geneKeyGift,
              reading: result.cosmicReadings?.gk
            },
            {
              label: 'Mayan Tzolkin',
              title: result.fingerprint?.mayanKin || 'Blue Storm',
              reading: result.cosmicReadings?.mayan
            },
            {
              label: 'Earth Medicine',
              title: result.fingerprint?.animalTotem,
              reading: result.totem
            },
            {
              label: 'Soul Level Astrology',
              title: result.fingerprint?.soulNode || 'The Guardian',
              reading: result.cosmicReadings?.soulLevel
            },
            {
              label: 'Bazi',
              title: result.fingerprint?.bazi || 'Water Pig',
              reading: result.cosmicReadings?.bazi
            },
            {
              label: 'Numerology',
              title: result.fingerprint?.lifePathNumber || 'The Builder',
              reading: result.cosmicReadings?.numerology
            },
            {
              label: 'Vedic Astrology',
              title: result.fingerprint?.vedic || result.fingerprint?.nakshatra,
              reading: result.cosmicReadings?.vedic
            },
            {
              label: 'Sun Sign Archetype',
              title: result.fingerprint?.sunSignArchetype || 'The Cardinal',
              reading: result.cosmicReadings?.sunSign
            },
            // BIOMETRIC SYNTHESIS - THE ANCHOR (Must be last)
            {
              label: 'Biometric Synthesis',
              title: `${result.fingerprint?.elementalClan || 'Verdant'} ${result.fingerprint?.animalTotem || 'Sentinel'}`,
              reading: result.cosmicReadings?.biometric,
              isAnchor: true
            },
          ].map((item, i) => {
            const hasContent = item.reading && item.reading !== 'N/A';
            const title = item.title && item.title !== 'N/A' ? item.title : 'Unknown';

            return (
              <div
                key={i}
                className={`
                  relative overflow-hidden rounded-xl p-8 md:p-12 transition-all duration-700
                  ${item.isAnchor
                    ? 'bg-gold/5 shadow-[0_4px_30px_rgba(212,175,55,0.1)] border border-gold/20'
                    : 'bg-white/5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] border border-transparent hover:border-gold/10'}
                `}
              >
                {/* 1. LABEL (Codex Tier - Sans) */}
                <span className="block font-sans text-xs tracking-[0.25em] text-gold/60 uppercase mb-3">
                  {item.label}
                </span>

                {/* 2. HEADER (Sacred Tier - Cinzel) */}
                <h3 className="text-2xl md:text-3xl font-cinzel text-gold mb-6 tracking-wide drop-shadow-lg">
                  {title}
                </h3>

                {/* 3. BODY (Revelation Tier - Serif) */}
                {hasContent ? (
                  <p className="font-serif text-lg md:text-xl text-gray-300 leading-loose opacity-90 font-light">
                    {item.reading}
                  </p>
                ) : (
                  <p className="font-serif text-gold/30 text-lg italic tracking-wider">
                    Sacred Silence
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SHARE PREVIEW — live, scaled-down render of the actual story card */}
      <div className="mt-16 flex flex-col items-center">
        <span className="mythic-brief-label mb-6 block text-gold/50 tracking-[0.4em] text-xs uppercase">Your Story Card</span>

        {/* Layout picker */}
        <div className="flex gap-2 mb-6">
          {([
            ['descent', 'Descent'],
            ['tablet', 'Tablet'],
            ['band', 'Band'],
          ] as [ShareLayout, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setLayout(key)}
              className={`px-5 py-2 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold transition-all border ${
                layout === key
                  ? 'bg-gold text-black border-gold'
                  : 'border-gold/30 text-gold/70 hover:border-gold/60'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Scaled preview: 1080×1920 card shown at 0.25 → 270×480 */}
        <div
          style={{ width: 270, height: 480 }}
          className="rounded-lg overflow-hidden border border-gold/20 shadow-2xl"
        >
          <div style={{ transform: 'scale(0.25)', transformOrigin: 'top left' }}>
            <ShareCard result={result} layout={layout} portrait={exportPortrait} />
          </div>
        </div>
      </div>

      {/* SYSTEM CONTROLS */}
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-12 pb-12">
        <button onClick={onReset} className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group">
          <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
          <span className="text-[10px] uppercase tracking-[0.2em]">New Inquiry</span>
        </button>
        <button
          onClick={sharePortrait}
          disabled={sharing}
          className="flex items-center gap-2 px-8 py-3 bg-gold text-black rounded-full hover:bg-gold/80 transition-all disabled:opacity-50"
        >
          <Share2 size={14} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">
            {sharing ? 'Conjuring…' : 'Share Portrait'}
          </span>
        </button>
        <button onClick={exportAsImage} className="flex items-center gap-2 px-8 py-3 border border-gold/40 text-gold rounded-full hover:bg-gold hover:text-black transition-all">
          <Download size={14} />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Full Revelation</span>
        </button>
      </div>

      {/* OFF-SCREEN SHARE CARD (rasterized by sharePortrait) */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        <ShareCard ref={shareRef} result={result} layout={layout} portrait={exportPortrait} />
      </div>
    </div>
  );
};

export default ResultReveal;