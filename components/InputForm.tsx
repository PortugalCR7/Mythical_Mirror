import React, { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { BirthData } from '../services/types';
import {
  Surface,
  Display,
  Eyebrow,
  Ornament,
  CTA,
} from './primitives';
import './InputForm.css';

interface Props {
  onSubmit: (data: BirthData) => void;
}

type FieldKey = 'name' | 'date' | 'time' | 'location';

const InputForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<BirthData>>({
    name: '',
    date: '',
    time: '',
    location: '',
    gender: 'feminine',
  });
  const [image, setImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setField = (key: FieldKey, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }));
    if (showErrorMsg) setShowErrorMsg(false);
  };

  const ingestFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      if (errors.image) setErrors((prev) => ({ ...prev, image: false }));
      if (showErrorMsg) setShowErrorMsg(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    ingestFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    ingestFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, boolean> = {};
    (['name', 'date', 'time', 'location'] as const).forEach((k) => {
      if (!formData[k]) next[k] = true;
    });
    if (!image) next.image = true;
    if (Object.keys(next).length > 0) {
      setErrors(next);
      setShowErrorMsg(true);
      return;
    }
    onSubmit({
      name: formData.name!,
      date: formData.date!,
      time: formData.time!,
      location: formData.location!,
      gender: formData.gender as 'masculine' | 'feminine',
      image: image!,
    });
  };

  return (
    <Surface>
      <div className="idle-page">
        <header className="idle-hero">
          <Eyebrow tone="meta">Your Descent Begins</Eyebrow>
          <Display level="display">The Mythic Mirror</Display>
          <p className="idle-subhead">Your reflection awaits.</p>
        </header>

        <form className="idle-card" onSubmit={handleSubmit} noValidate>
          <div className="idle-field">
            <Eyebrow tone="meta">Name</Eyebrow>
            <input
              type="text"
              className={`idle-input${errors.name ? ' idle-input--error' : ''}`}
              placeholder="who arrives at the glass"
              value={formData.name}
              onChange={(e) => setField('name', e.target.value)}
              autoComplete="given-name"
            />
          </div>

          <div className="idle-row">
            <div className="idle-field">
              <Eyebrow tone="meta">Birth Date</Eyebrow>
              <input
                type="date"
                className={`idle-input${errors.date ? ' idle-input--error' : ''}`}
                value={formData.date}
                onChange={(e) => setField('date', e.target.value)}
              />
            </div>
            <div className="idle-field">
              <Eyebrow tone="meta">Birth Time</Eyebrow>
              <input
                type="time"
                className={`idle-input${errors.time ? ' idle-input--error' : ''}`}
                value={formData.time}
                onChange={(e) => setField('time', e.target.value)}
              />
            </div>
          </div>

          <div className="idle-field">
            <Eyebrow tone="meta">Origin Point</Eyebrow>
            <input
              type="text"
              className={`idle-input${errors.location ? ' idle-input--error' : ''}`}
              placeholder="city, country"
              value={formData.location}
              onChange={(e) => setField('location', e.target.value)}
              autoComplete="address-level2"
            />
          </div>

          <div className="idle-field">
            <Eyebrow tone="meta">Path</Eyebrow>
            <div className="idle-path" role="radiogroup" aria-label="Path">
              {(['feminine', 'masculine'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={formData.gender === g}
                  className={`idle-path-option${formData.gender === g ? ' idle-path-option--active' : ''}`}
                  onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="idle-break" aria-hidden="true">
            <Ornament />
          </div>

          <div className="idle-field">
            <Eyebrow tone="meta">Offer Your Likeness</Eyebrow>
            <div
              className={`idle-dropzone${image ? ' idle-dropzone--filled' : ''}${isDragging ? ' idle-dropzone--drag' : ''}${errors.image ? ' idle-input--error' : ''}`}
              onClick={() => !image && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              {image ? (
                <>
                  <img src={image} alt="your likeness" className="idle-dropzone-image" />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    aria-label="Remove photo"
                    style={{
                      position: 'absolute',
                      top: 'var(--mm-s-2)',
                      right: 'var(--mm-s-2)',
                      background: 'rgba(7,7,16,0.7)',
                      border: '1px solid var(--mm-inscription)',
                      color: 'var(--mm-lumen)',
                      width: 32,
                      height: 32,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="idle-dropzone-empty">
                  <Camera size={24} strokeWidth={1.25} color="var(--mm-inscription)" />
                  <span className="idle-dropzone-empty-label">Offer your likeness</span>
                  <span className="idle-dropzone-empty-hint">
                    the photograph carries your face into the archetype
                  </span>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {showErrorMsg && (
            <p className="idle-error-msg" role="alert">
              The Oracle requires all fields and your likeness to proceed.
            </p>
          )}

          <div className="idle-submit-row">
            <CTA type="submit" variant="primary">Descend</CTA>
          </div>
        </form>

        <div className="idle-footer">The Mythic Mirror · Est. 2026</div>
      </div>
    </Surface>
  );
};

export default InputForm;
