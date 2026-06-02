/*
  /design-test — a primitives showcase, gated by URL hash (#design-test).
  Renders every primitive, every variant, against the Surface so the
  redesign tokens can be eyeballed in-browser before any real screen is
  touched. Delete this file once the redesign ships if it's no longer
  useful.
*/

import React from 'react';
import {
  Surface,
  Eyebrow,
  Display,
  Scripture,
  HairlineRule,
  Ornament,
  InscriptionRail,
  MetaPair,
  CTA,
} from './primitives';

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <section style={{ marginBottom: 'var(--mm-s-5)' }}>
    <Eyebrow tone="meta">{label}</Eyebrow>
    <HairlineRule />
    <div style={{ marginTop: 'var(--mm-s-3)' }}>{children}</div>
  </section>
);

const Swatch: React.FC<{ name: string; varName: string }> = ({ name, varName }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--mm-s-2)', marginBottom: 'var(--mm-s-2)' }}>
    <span
      style={{
        display: 'inline-block',
        width: 56,
        height: 56,
        background: `var(${varName})`,
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    />
    <div>
      <div style={{ fontFamily: 'var(--mm-font-display)', fontSize: 12, letterSpacing: '0.18em', color: 'var(--mm-lumen)', textTransform: 'uppercase' }}>{name}</div>
      <div style={{ fontFamily: 'var(--mm-font-body)', fontSize: 14, color: 'var(--mm-antique)' }}>{varName}</div>
    </div>
  </div>
);

const DesignTest: React.FC = () => {
  return (
    <Surface>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 960,
          margin: '0 auto',
          padding: 'var(--mm-s-5) var(--mm-gutter)',
        }}
      >
        <Eyebrow tone="action">Design Test · Mythical Mirror Redesign</Eyebrow>
        <div style={{ marginTop: 'var(--mm-s-2)' }}>
          <Display level="display">The Mirror</Display>
        </div>

        <Section label="Color · Obsidian">
          <Swatch name="Obsidian" varName="--mm-obsidian" />
          <Swatch name="Obsidian Rise" varName="--mm-obsidian-rise" />
          <Swatch name="Obsidian Deep" varName="--mm-obsidian-deep" />
        </Section>

        <Section label="Color · Lumen (the page)">
          <Swatch name="Lumen" varName="--mm-lumen" />
          <Swatch name="Lumen Soft" varName="--mm-lumen-soft" />
        </Section>

        <Section label="Color · Gold ladder">
          <Swatch name="Inscription · #C68B3C" varName="--mm-inscription" />
          <Swatch name="Antique · #8A7340" varName="--mm-antique" />
        </Section>

        <Section label="Color · Lavender + Ember">
          <Swatch name="Lavender" varName="--mm-lavender" />
          <Swatch name="Lavender Dim" varName="--mm-lavender-dim" />
          <Swatch name="Ember (error)" varName="--mm-ember" />
        </Section>

        <Section label="Typography · Display tier (Cinzel)">
          <Display level="display">The Descent</Display>
          <div style={{ marginTop: 'var(--mm-s-3)' }}>
            <Display level="title">The Revelation</Display>
          </div>
          <div style={{ marginTop: 'var(--mm-s-3)' }}>
            <Display level="heading">A Reading In Three Movements</Display>
          </div>
        </Section>

        <Section label="Typography · Eyebrows">
          <div style={{ display: 'flex', gap: 'var(--mm-s-3)', flexWrap: 'wrap' }}>
            <Eyebrow tone="meta">Your Descent</Eyebrow>
            <Eyebrow tone="action">Full Revelation</Eyebrow>
          </div>
        </Section>

        <Section label="Typography · Scripture (Cormorant, italic, drop-cap)">
          <Scripture>
            <p>
              In the hush before the name is spoken, the threshold holds its breath. The seeker
              approaches not as one who knocks, but as one already heard. The mirror has been
              waiting — quietly, attentively, with the patience that belongs only to stones and
              old gods. What you see here was never invented; it was remembered.
            </p>
            <p>
              The second paragraph carries no drop-cap. It walks. It does not announce itself.
              The reading proceeds in stanzas of prose, each one a step further into the cavern.
            </p>
          </Scripture>
        </Section>

        <Section label="Primitives · MetaPair (the Cosmic Code data)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--mm-s-3)' }}>
            <MetaPair label="Life Path" value="7" />
            <MetaPair label="Sun Sign" value="Scorpio" />
            <MetaPair label="Mayan Tzolkin" value="9 Imix" />
            <MetaPair label="Bazi Year Pillar" value="Wood Tiger" />
            <MetaPair label="Soul Node" value="The Threshold Keeper" />
            <MetaPair label="Ruling Planet" value="Saturn" />
          </div>
        </Section>

        <Section label="Primitives · Hairline rules + ornament">
          <HairlineRule />
          <HairlineRule width="wide" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--mm-s-2)', color: 'var(--mm-inscription)' }}>
            <span style={{ flex: 1, height: 1, background: 'var(--mm-inscription)', opacity: 0.4 }} />
            <Ornament />
            <span style={{ flex: 1, height: 1, background: 'var(--mm-inscription)', opacity: 0.4 }} />
          </div>
        </Section>

        <Section label="Primitives · CTA variants">
          <div style={{ display: 'flex', gap: 'var(--mm-s-2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <CTA variant="primary">Descend</CTA>
            <CTA variant="inscription">Share Portrait</CTA>
            <CTA variant="inscription" disabled>Disabled</CTA>
            <CTA variant="quiet">Full Revelation →</CTA>
          </div>
        </Section>

        <Section label="Primitives · Inscription Rail (loading metaphor)">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--mm-s-3)',
              height: 240,
              border: '1px dashed rgba(255,255,255,0.08)',
              padding: 'var(--mm-s-3)',
            }}
          >
            <InscriptionRail>The Mythical Mirror · Est. 2026 · ◇</InscriptionRail>
            <div style={{ flex: 1, color: 'var(--mm-lavender)', fontFamily: 'var(--mm-font-body)', fontSize: 14 }}>
              The rail lives along desktop margins and replaces centered spinners during loading
              states. On mobile it collapses to a horizontal eyebrow at the top of the screen.
            </div>
          </div>
        </Section>

        <Section label="Type scale reference">
          <div style={{ color: 'var(--mm-lumen-soft)', fontFamily: 'var(--mm-font-body)', fontSize: 14, lineHeight: 1.6 }}>
            <div>Display: <code>clamp(56px, 8vw, 112px)</code> · Cinzel 500 · 0.04em</div>
            <div>Title: <code>clamp(36px, 5vw, 64px)</code> · Cinzel 500 · 0.03em</div>
            <div>Heading: <code>clamp(22px, 2.4vw, 28px)</code> · Cinzel 500 · 0.02em</div>
            <div>Body large: <code>20px / 18px</code> · Cormorant 400</div>
            <div>Body: <code>17px / 16px</code> · Cormorant 400</div>
            <div>Eyebrow: <code>12px / 11px</code> · Cinzel 500 · 0.22em · UPPER</div>
            <div>CTA: <code>13px / 12px</code> · Cinzel 500 · 0.28em · UPPER</div>
          </div>
        </Section>
      </div>
    </Surface>
  );
};

export default DesignTest;
