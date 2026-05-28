import './ResultReveal.css';
import React from 'react';
import { OracleResult } from '../services/types';
import { toPng, toBlob } from 'html-to-image';
import ShareCard from './ShareCard';
import {
  Surface,
  Eyebrow,
  InscriptionRail,
  Ornament,
  CTA,
} from './primitives';

interface Props {
  result: OracleResult;
  onReset: () => void;
}

type Phase = 'SCRIPTURE' | 'MANIFESTATION';

const ResultReveal: React.FC<Props> = ({ result, onReset }) => {
  const [phase, setPhase] = React.useState<Phase>('SCRIPTURE');
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState(false);
  const [sharing, setSharing] = React.useState(false);
  const shareRef = React.useRef<HTMLDivElement>(null);

  // Cross-origin portrait → data URL (preserves the existing pipeline).
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
      } catch {
        if (!cancelled) setExportPortrait(rawPortrait);
      }
    })();
    return () => { cancelled = true; };
  }, [rawPortrait]);

  const exportFullRevelation = async () => {
    const node = document.getElementById('mythic-card');
    if (!node) return;
    const dataUrl = await toPng(node, { cacheBust: true, backgroundColor: '#070710' });
    const link = document.createElement('a');
    link.download = `revelation-${result.id}.png`;
    link.href = dataUrl;
    link.click();
  };

  const sharePortrait = async () => {
    if (!shareRef.current || sharing) return;
    setSharing(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      const blob = await toBlob(shareRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor: '#070710',
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
      if (err?.name !== 'AbortError') console.error('Share failed:', err);
    } finally {
      setSharing(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    // TODO(backend): POST the email + reading id to a serverless endpoint
    // that sends the rasterized revelation as an attachment. For now, the
    // email is captured client-side and the local PNG download is triggered
    // so the user receives something.
    console.log('[email-capture]', { email: email.trim(), readingId: result.id });
    await exportFullRevelation();
    setEmailOpen(false);
  };

  // -------------------------- SCRIPTURE PHASE --------------------------
  if (phase === 'SCRIPTURE') {
    return (
      <Surface>
        <div className="reveal-frame">
          <aside className="reveal-rail">
            <InscriptionRail>The Mythic Mirror · The Lost Scripture · ◇</InscriptionRail>
          </aside>
          <main className="reveal-column">
            <div className="scripture-stage">
              <div className="scripture-eyebrow">
                <Eyebrow tone="meta">{(result.culture || 'Ancient')} Lineage</Eyebrow>
              </div>
              <h1
                className="manifest-hero-name"
                style={{ fontSize: 'clamp(48px, 7vw, 96px)', textShadow: 'none' }}
              >
                {result.archetype}
              </h1>
              {result.mythopoeticBrief?.one_liner && (
                <p className="scripture-oneliner">{result.mythopoeticBrief.one_liner}</p>
              )}
              <div className="scripture-break"><Ornament /></div>
              <div className="mm-scripture">
                <p>{result.mythopoeticBrief?.descent}</p>
              </div>
              <div className="scripture-break"><Ornament /></div>
              <div className="scripture-cta-row">
                <CTA variant="primary" onClick={() => setPhase('MANIFESTATION')}>
                  Enter The Mirror
                </CTA>
              </div>
            </div>
          </main>
        </div>
      </Surface>
    );
  }

  // ------------------------- MANIFESTATION PHASE -----------------------
  const cosmicEntries: Array<{ label: string; value?: string; reading?: string; isAnchor?: boolean }> = [
    { label: 'Human Design',         value: result.fingerprint?.humanDesignProfile,                         reading: result.cosmicReadings?.hds },
    { label: 'Gene Keys',            value: result.fingerprint?.geneKeyGift,                                reading: result.cosmicReadings?.gk },
    { label: 'Mayan Tzolkin',        value: result.fingerprint?.mayanKin,                                   reading: result.cosmicReadings?.mayan },
    { label: 'Earth Medicine',       value: result.fingerprint?.animalTotem,                                reading: result.totem },
    { label: 'Soul Level Astrology', value: result.fingerprint?.soulNode,                                   reading: result.cosmicReadings?.soulLevel },
    { label: 'Bazi',                 value: result.fingerprint?.bazi,                                       reading: result.cosmicReadings?.bazi },
    { label: 'Numerology',           value: result.fingerprint?.lifePathNumber?.toString(),                 reading: result.cosmicReadings?.numerology },
    { label: 'Vedic Astrology',      value: result.fingerprint?.vedic || result.fingerprint?.nakshatra,     reading: result.cosmicReadings?.vedic },
    { label: 'Sun Sign Archetype',   value: result.fingerprint?.sunSignArchetype,                          reading: result.cosmicReadings?.sunSign },
    {
      label: 'Biometric Synthesis',
      value: `${result.fingerprint?.elementalClan || 'Verdant'} ${result.fingerprint?.animalTotem || 'Sentinel'}`,
      reading: result.cosmicReadings?.biometric,
      isAnchor: true,
    },
  ];

  return (
    <Surface>
      <div className="reveal-frame">
        <aside className="reveal-rail">
          <InscriptionRail>The Mythic Mirror · The Revelation · ◇</InscriptionRail>
        </aside>

        <main className="reveal-column" id="mythic-card">
          <div className="manifest-stage">

            {/* Hero lockup — portrait + archetype name overlay */}
            <div className="manifest-hero">
              {rawPortrait ? (
                <img
                  src={rawPortrait}
                  alt={result.archetype}
                  className="manifest-hero-image"
                />
              ) : (
                <div className="manifest-hero-image" style={{ background: '#0E0E1A' }} />
              )}
              <div className="manifest-hero-scrim" />
              <div className="manifest-hero-lockup">
                <Eyebrow tone="meta">
                  {(result.culture || 'Ancient')} Lineage
                </Eyebrow>
                <h1 className="manifest-hero-name">{result.archetype}</h1>
                {result.mythopoeticBrief?.one_liner && (
                  <p className="manifest-hero-oneliner">{result.mythopoeticBrief.one_liner}</p>
                )}
              </div>
            </div>

            {/* Likeness lore */}
            {result.mythopoeticBrief?.likeness_lore && (
              <section className="manifest-section">
                <div className="manifest-section-eyebrow">
                  <Eyebrow tone="meta">The Likeness</Eyebrow>
                </div>
                <blockquote className="manifest-quote">
                  {result.mythopoeticBrief.likeness_lore}
                </blockquote>
              </section>
            )}

            {/* Descent (recap, smaller than the scripture phase) */}
            {result.mythopoeticBrief?.descent && (
              <section className="manifest-section">
                <div className="manifest-section-eyebrow">
                  <Eyebrow tone="meta">The Descent</Eyebrow>
                </div>
                <p className="manifest-body" style={{ fontStyle: 'italic' }}>
                  {result.mythopoeticBrief.descent}
                </p>
              </section>
            )}

            {result.mythopoeticBrief?.reclamation && (
              <section className="manifest-section">
                <div className="manifest-section-eyebrow">
                  <Eyebrow tone="meta">The Reclamation</Eyebrow>
                </div>
                <p className="manifest-body">{result.mythopoeticBrief.reclamation}</p>
              </section>
            )}

            {result.mythopoeticBrief?.devotion && (
              <section className="manifest-section">
                <div className="manifest-section-eyebrow">
                  <Eyebrow tone="meta">The Devotion</Eyebrow>
                </div>
                <p className="manifest-body">{result.mythopoeticBrief.devotion}</p>
              </section>
            )}

            {/* Cosmic Code — inline editorial entries, no panels */}
            <section>
              <div className="manifest-section-eyebrow">
                <Eyebrow tone="meta">Cosmic Code</Eyebrow>
              </div>
              <div className="cosmic-list">
                {cosmicEntries.map((entry, i) => {
                  const hasReading = entry.reading && entry.reading !== 'N/A';
                  const value = entry.value && entry.value !== 'N/A' ? entry.value : 'Sacred Silence';
                  return (
                    <div
                      key={i}
                      className={`cosmic-entry${entry.isAnchor ? ' cosmic-entry--anchor' : ''}`}
                    >
                      <Eyebrow tone="action">{entry.label}</Eyebrow>
                      <h3 className="cosmic-entry-value">{value}</h3>
                      {hasReading ? (
                        <p className="cosmic-entry-body">{entry.reading}</p>
                      ) : (
                        <p className="cosmic-entry-body cosmic-entry-silence">Sacred silence.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Story-card preview */}
            <section className="preview-block">
              <Eyebrow tone="meta">Your Story Card</Eyebrow>
              <div className="preview-frame">
                <div className="preview-scale">
                  <ShareCard result={result} portrait={exportPortrait} />
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="reveal-actions">
              <CTA
                variant="inscription"
                onClick={sharePortrait}
                disabled={sharing}
              >
                {sharing ? 'Conjuring…' : 'Share Portrait'}
              </CTA>
              <CTA variant="primary" onClick={() => setEmailOpen(true)}>
                Full Revelation
              </CTA>
              <CTA variant="quiet" onClick={onReset}>New Reading</CTA>
            </div>
          </div>
        </main>
      </div>

      {/* Off-screen ShareCard for rasterization (unchanged contract) */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
        <ShareCard ref={shareRef} result={result} portrait={exportPortrait} />
      </div>

      {/* Email-capture overlay */}
      {emailOpen && (
        <div
          className="email-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="email-heading"
          onClick={(e) => { if (e.target === e.currentTarget) setEmailOpen(false); }}
        >
          <form className="email-panel" onSubmit={handleEmailSubmit}>
            <button
              type="button"
              className="email-close"
              onClick={() => setEmailOpen(false)}
              aria-label="Close"
            >
              Close ×
            </button>
            <Eyebrow tone="action">Full Revelation</Eyebrow>
            <h2 id="email-heading" className="email-heading">
              Where shall the revelation arrive?
            </h2>
            <p className="email-sub">
              Your full reading will be sent as a high-resolution image. One message,
              no list.
            </p>
            <div className="email-input-row">
              <div className="idle-field" style={{ gap: 8 }}>
                <Eyebrow tone="meta">Email</Eyebrow>
                <input
                  type="email"
                  className={`idle-input${emailError ? ' idle-input--error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(false); }}
                  autoFocus
                  autoComplete="email"
                />
              </div>
              <CTA type="submit" variant="primary">Deliver</CTA>
            </div>
            <p className="email-fine">
              We use your email only to send this revelation. Nothing else.
            </p>
          </form>
        </div>
      )}
    </Surface>
  );
};

export default ResultReveal;
