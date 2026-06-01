import React from 'react';
import { OracleResult } from '../services/types';

interface Props {
  result: OracleResult;
  /**
   * Pre-resolved portrait (data URL). History portraits arrive as cross-origin
   * Supabase signed URLs that taint the html-to-image canvas; ResultReveal
   * resolves them to a data URL and passes it here so rasterization succeeds.
   */
  portrait?: string;
}

/**
 * SHARE CARD — a fixed 1080×1920 (9:16) story-format card optimized for
 * Instagram / TikTok / Snapchat stories. The generated mythic portrait runs
 * full-bleed; obsidian→transparent scrims carry the gold typography so the
 * costume, props and culturally-specific background stay visible (the whole
 * point of the image-to-image pipeline). Rendered off-screen and rasterized
 * via html-to-image. Inline px styling keeps output viewport-independent.
 */
const GOLD = '#F3D060';
const OBSIDIAN = '#050505';
const W = 1080;
const H = 1920;

const Portrait: React.FC<{ src?: string; alt: string }> = ({ src, alt }) =>
  src ? (
    <img
      src={src}
      crossOrigin="anonymous"
      alt={alt}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        // No grayscale — these portraits live on their colour (jade, gold, forest).
      }}
    />
  ) : (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: '#111' }} />
  );

const Lineage: React.FC<{ culture?: string; style?: React.CSSProperties }> = ({ culture, style }) => (
  <div
    style={{
      color: 'rgba(243,208,96,0.7)',
      letterSpacing: '0.5em',
      fontSize: 24,
      textTransform: 'uppercase',
      textAlign: 'center',
      textShadow: '0 2px 18px rgba(0,0,0,0.85)',
      ...style,
    }}
  >
    {(culture || 'Ancient')} Lineage
  </div>
);

const Title: React.FC<{ text: string; size?: number }> = ({ text, size = 104 }) => (
  <h1
    style={{
      fontFamily: 'Cinzel, serif',
      color: GOLD,
      fontSize: size,
      margin: 0,
      lineHeight: 1.02,
      fontWeight: 700,
      textAlign: 'center',
      textShadow: '0 4px 40px rgba(0,0,0,0.6)',
    }}
  >
    {text}
  </h1>
);

const OneLiner: React.FC<{ text: string }> = ({ text }) => (
  <p
    style={{
      color: 'rgba(243,208,96,0.85)',
      fontStyle: 'italic',
      letterSpacing: '0.14em',
      fontSize: 34,
      textTransform: 'uppercase',
      margin: 0,
      textAlign: 'center',
      textShadow: '0 2px 24px rgba(0,0,0,0.7)',
    }}
  >
    {text}
  </p>
);

const Name: React.FC<{ text: string }> = ({ text }) => (
  <p
    style={{
      color: 'rgba(255,255,255,0.7)',
      fontSize: 30,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      margin: 0,
      textAlign: 'center',
      textShadow: '0 2px 16px rgba(0,0,0,0.8)',
    }}
  >
    {text}
  </p>
);

const Wordmark: React.FC = () => (
  <div style={{ textAlign: 'center' }}>
    <div
      style={{
        fontFamily: 'Cinzel, serif',
        color: 'rgba(243,208,96,0.9)',
        fontSize: 30,
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
      }}
    >
      The Mythical Mirror
    </div>
    <div
      style={{
        color: 'rgba(255,255,255,0.45)',
        fontSize: 22,
        letterSpacing: '0.22em',
        marginTop: 10,
      }}
    >
      mythical-mirror.vercel.app
    </div>
  </div>
);

const frame = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  width: W,
  height: H,
  position: 'relative',
  backgroundColor: OBSIDIAN,
  color: '#fff',
  fontFamily: 'Inter, sans-serif',
  overflow: 'hidden',
  ...extra,
});

const ShareCard = React.forwardRef<HTMLDivElement, Props>(({ result, portrait: portraitOverride }, ref) => {
  const portrait = portraitOverride || result.generatedImage || result.userImage;
  const title = result.archetype;
  const oneLiner = result.mythopoeticBrief?.one_liner;
  const name = result.birthData?.name;
  const culture = result.culture;

  // DESCENT — bottom-weighted: clean image up top, all type stacked low.
  return (
    <div ref={ref} style={frame()}>
      <Portrait src={portrait} alt={title} />
      {/* gold glow at top edge */}
      <div style={{ position: 'absolute', top: -260, left: '50%', transform: 'translateX(-50%)', width: 1000, height: 640, background: 'rgba(243,208,96,0.10)', filter: 'blur(180px)', pointerEvents: 'none' }} />
      {/* deep bottom scrim */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1040, background: 'linear-gradient(to top, rgba(5,5,5,0.97) 22%, rgba(5,5,5,0.6) 55%, rgba(5,5,5,0))' }} />
      {/* light top scrim for eyebrow legibility on bright skies */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: 'linear-gradient(to bottom, rgba(5,5,5,0.65), rgba(5,5,5,0))' }} />
      {/* top eyebrow */}
      <div style={{ position: 'absolute', top: 110, left: 80, right: 80 }}>
        <Lineage culture={culture} />
      </div>
      {/* bottom stack */}
      <div style={{ position: 'absolute', bottom: 110, left: 80, right: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        <Title text={title} />
        {oneLiner && <OneLiner text={oneLiner} />}
        {name && <Name text={name} />}
        <div style={{ width: 140, height: 1, background: 'rgba(243,208,96,0.4)', margin: '12px 0' }} />
        <Wordmark />
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
