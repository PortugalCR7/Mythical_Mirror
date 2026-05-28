import React from 'react';
import './primitives.css';

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type SpanProps = React.HTMLAttributes<HTMLSpanElement>;
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(' ');


/* ---------- Eyebrow ---------- */
export const Eyebrow: React.FC<SpanProps & { tone?: 'meta' | 'action' }> = ({
  tone = 'meta', className, children, ...rest
}) => (
  <span className={cx('mm-eyebrow', `mm-eyebrow--${tone}`, className)} {...rest}>
    {children}
  </span>
);


/* ---------- Display ---------- */
type DisplayLevel = 'display' | 'title' | 'heading';
type DisplayProps = React.HTMLAttributes<HTMLHeadingElement> & {
  level?: DisplayLevel;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
};
export const Display: React.FC<DisplayProps> = ({
  level = 'title', as, className, children, ...rest
}) => {
  const Tag = as ?? (level === 'display' ? 'h1' : level === 'title' ? 'h2' : 'h3');
  return (
    <Tag className={cx('mm-display', `mm-display--${level}`, className)} {...rest}>
      {children}
    </Tag>
  );
};


/* ---------- Scripture ---------- */
export const Scripture: React.FC<DivProps> = ({ className, children, ...rest }) => (
  <div className={cx('mm-scripture', className)} {...rest}>{children}</div>
);


/* ---------- HairlineRule ---------- */
export const HairlineRule: React.FC<
  React.HTMLAttributes<HTMLHRElement> & { width?: 'default' | 'wide' | 'full' }
> = ({ width = 'default', className, ...rest }) => (
  <hr
    className={cx('mm-rule', width !== 'default' && `mm-rule--${width}`, className)}
    {...rest}
  />
);


/* ---------- Ornament ----------
   The single reserved glyph. Used at chapter breaks and on the share-card
   wordmark. Diamond chosen as the hairline knot stand-in until a custom
   SVG is commissioned. */
export const Ornament: React.FC<SpanProps> = ({ className, ...rest }) => (
  <span
    className={cx('mm-ornament', className)}
    aria-hidden="true"
    {...rest}
  >
    {'◇'}
  </span>
);


/* ---------- InscriptionRail ---------- */
export const InscriptionRail: React.FC<SpanProps> = ({ className, children, ...rest }) => (
  <span className={cx('mm-rail', className)} {...rest}>{children}</span>
);


/* ---------- MetaPair ---------- */
export const MetaPair: React.FC<{ label: string; value: React.ReactNode; className?: string }> = ({
  label, value, className,
}) => (
  <div className={cx('mm-meta-pair', className)}>
    <Eyebrow tone="meta">{label}</Eyebrow>
    <span className="mm-meta-pair__value">{value}</span>
  </div>
);


/* ---------- CTA ---------- */
type CTAVariant = 'inscription' | 'primary' | 'quiet';
export const CTA: React.FC<ButtonProps & { variant?: CTAVariant }> = ({
  variant = 'inscription', className, children, ...rest
}) => (
  <button
    type="button"
    className={cx('mm-cta', variant !== 'inscription' && `mm-cta--${variant}`, className)}
    {...rest}
  >
    {children}
  </button>
);


/* ---------- Surface ---------- */
export const Surface: React.FC<DivProps> = ({ className, children, ...rest }) => (
  <div className={cx('mm-surface', className)} {...rest}>{children}</div>
);
