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
const INSCRIPTION = '#C68B3C';
const LUMEN = '#F4ECD8';
const LUMEN_SOFT = '#E6DFCB';
const OBSIDIAN = '#070710';
const OBSIDIAN_DEEP = '#04040A';
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
      }}
    />
  ) : (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: OBSIDIAN_DEEP }} />
  );

const Lineage: React.FC<{ culture?: string; style?: React.CSSProperties }> = ({ culture, style }) => (
  <div
    style={{
      fontFamily: 'Cinzel, serif',
      fontWeight: 500,
      color: 'rgba(159, 156, 196, 0.85)',
      letterSpacing: '0.42em',
      fontSize: 26,
      textTransform: 'uppercase',
      textAlign: 'center',
      textShadow: '0 2px 18px rgba(0,0,0,0.85)',
      ...style,
    }}
  >
    {(culture || 'Ancient')} Lineage
  </div>
);

const Title: React.FC<{ text: string; size?: number }> = ({ text, size = 110 }) => (
  <h1
    style={{
      fontFamily: 'Cinzel, serif',
      color: LUMEN,
      fontSize: size,
      margin: 0,
      lineHeight: 1.02,
      fontWeight: 500,
      letterSpacing: '0.035em',
      textTransform: 'uppercase',
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
      fontFamily: 'Cormorant Garamond, serif',
      color: LUMEN_SOFT,
      fontStyle: 'italic',
      letterSpacing: '0.04em',
      fontSize: 38,
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
      fontFamily: 'Cinzel, serif',
      fontWeight: 500,
      color: 'rgba(244, 236, 216, 0.75)',
      fontSize: 30,
      letterSpacing: '0.24em',
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
        fontWeight: 500,
        color: INSCRIPTION,
        fontSize: 32,
        letterSpacing: '0.36em',
        textTransform: 'uppercase',
      }}
    >
      The Mythic Mirror
    </div>
    <div
      style={{
        fontFamily: 'Cinzel, serif',
        color: 'rgba(244, 236, 216, 0.5)',
        fontSize: 20,
        letterSpacing: '0.24em',
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
  color: LUMEN,
  fontFamily: 'Cormorant Garamond, serif',
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
      {/* deep bottom scrim — pulls obsidian up into the lower 60% */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1100, background: 'linear-gradient(to top, rgba(7,7,16,0.97) 20%, rgba(7,7,16,0.62) 55%, rgba(7,7,16,0))' }} />
      {/* light top scrim for eyebrow legibility */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: 'linear-gradient(to bottom, rgba(7,7,16,0.65), rgba(7,7,16,0))' }} />
      {/* top eyebrow */}
      <div style={{ position: 'absolute', top: 110, left: 80, right: 80 }}>
        <Lineage culture={culture} />
      </div>
      {/* bottom stack */}
      <div style={{ position: 'absolute', bottom: 110, left: 80, right: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
        <Title text={title} />
        {oneLiner && <OneLiner text={oneLiner} />}
        {name && <Name text={name} />}
        <div style={{ width: 24, color: INSCRIPTION, fontSize: 22, textAlign: 'center', marginTop: 4 }}>◇</div>
        <div style={{ width: 140, height: 1, background: 'rgba(198,139,60,0.55)', margin: '8px 0 0' }} />
        <Wordmark />
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
