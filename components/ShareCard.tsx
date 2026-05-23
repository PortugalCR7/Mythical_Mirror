import React from 'react';
import { OracleResult } from '../services/types';

interface Props {
  result: OracleResult;
}

/**
 * SHARE CARD — a fixed 1080×1350 (4:5) portrait-format card optimized for
 * social sharing. Rendered off-screen and rasterized via html-to-image.
 * Uses inline px styling so the output dimensions are viewport-independent.
 */
const GOLD = '#F3D060';
const OBSIDIAN = '#050505';

const ShareCard = React.forwardRef<HTMLDivElement, Props>(({ result }, ref) => {
  const portrait = result.generatedImage || result.userImage;

  return (
    <div
      ref={ref}
      style={{
        width: 1080,
        height: 1350,
        position: 'relative',
        backgroundColor: OBSIDIAN,
        color: '#fff',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '96px 80px',
        boxSizing: 'border-box',
      }}
    >
      {/* Gold glow */}
      <div
        style={{
          position: 'absolute',
          top: -220,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 900,
          height: 620,
          background: 'rgba(243,208,96,0.10)',
          filter: 'blur(160px)',
          pointerEvents: 'none',
        }}
      />

      {/* Lineage */}
      <div
        style={{
          position: 'relative',
          color: 'rgba(243,208,96,0.6)',
          letterSpacing: '0.5em',
          fontSize: 22,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {(result.culture || 'Ancient')} Lineage
      </div>

      {/* Portrait */}
      <div
        style={{
          position: 'relative',
          width: 560,
          height: 560,
          borderRadius: '50%',
          border: '3px solid rgba(243,208,96,0.35)',
          padding: 10,
          boxSizing: 'border-box',
          boxShadow: '0 0 60px rgba(243,208,96,0.15)',
        }}
      >
        {portrait && (
          <img
            src={portrait}
            crossOrigin="anonymous"
            alt={result.archetype}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%',
              filter: 'grayscale(20%) contrast(110%)',
            }}
          />
        )}
      </div>

      {/* Identity */}
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            color: GOLD,
            fontSize: 84,
            margin: 0,
            lineHeight: 1.05,
            fontWeight: 700,
          }}
        >
          {result.archetype}
        </h1>

        {result.mythopoeticBrief.one_liner && (
          <p
            style={{
              color: 'rgba(243,208,96,0.7)',
              fontStyle: 'italic',
              letterSpacing: '0.15em',
              fontSize: 30,
              textTransform: 'uppercase',
              margin: '28px 0 0',
            }}
          >
            {result.mythopoeticBrief.one_liner}
          </p>
        )}

        {result.birthData?.name && (
          <p
            style={{
              color: 'rgba(255,255,255,0.55)',
              fontSize: 26,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin: '24px 0 0',
            }}
          >
            {result.birthData.name}
          </p>
        )}
      </div>

      {/* Wordmark */}
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'Cinzel, serif',
            color: 'rgba(243,208,96,0.85)',
            fontSize: 28,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
          }}
        >
          The Mythical Mirror
        </div>
        <div
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 20,
            letterSpacing: '0.2em',
            marginTop: 10,
          }}
        >
          mythical-mirror.vercel.app
        </div>
      </div>
    </div>
  );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
