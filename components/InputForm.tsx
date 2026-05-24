import React, { useState, useRef } from 'react';
import { Camera, X, Moon, Sun } from 'lucide-react';
import { BirthData } from '../services/types'; // FIXED PATH

interface Props {
  onSubmit: (data: BirthData) => void;
}

const InputForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Partial<BirthData>>({
    name: '',
    date: '',
    time: '',
    location: '',
    gender: 'feminine' // Added default
  });
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Verification includes gender now
    if (formData.name && formData.date && formData.time && formData.location && formData.gender && image) {
      onSubmit({
        name: formData.name,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        gender: formData.gender as 'masculine' | 'feminine',
        image: image,
      });
    } else {
        alert("The Oracle requires all fields and your likeness to proceed.");
    }
  };

  return (
    <div className="w-full space-y-12 animate-[fadeIn_1s_ease-out] py-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 
            className="font-serif font-bold tracking-widest drop-shadow-md bg-gradient-to-b from-gold to-white bg-clip-text text-transparent uppercase"
            style={{ fontSize: '3rem' }}
        >
          THE MYTHICAL MIRROR
        </h1>
        <p 
            className="text-lavenderPurple font-serif uppercase"
            style={{ fontSize: '0.9rem', letterSpacing: '4px' }}
        >
          CONSULT THE ORACLE OF THE COLLECTIVE IMAGINAL
        </p>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-10 p-10 rounded-[8px] border border-gold bg-[radial-gradient(circle_at_center,var(--obsidian-radial-center),var(--obsidian-bg))] shadow-2xl relative overflow-hidden"
      >
        
        <div className="space-y-8 relative z-10">
            {/* PATH SELECTION (GENDER TOGGLE) */}
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-lavenderPurple mb-4 font-serif text-center">Select Your Path</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'feminine' })}
                  className={`flex items-center justify-center gap-3 p-4 border transition-all duration-500 rounded-lg ${
                    formData.gender === 'feminine' 
                    ? 'border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                    : 'border-gold/20 text-lavenderDim opacity-50 hover:opacity-100 hover:border-gold/40'
                  }`}
                >
                  <Moon size={16} />
                  <span className="text-[10px] uppercase tracking-widest font-serif">Feminine</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'masculine' })}
                  className={`flex items-center justify-center gap-3 p-4 border transition-all duration-500 rounded-lg ${
                    formData.gender === 'masculine' 
                    ? 'border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                    : 'border-gold/20 text-lavenderDim opacity-50 hover:opacity-100 hover:border-gold/40'
                  }`}
                >
                  <Sun size={16} />
                  <span className="text-[10px] uppercase tracking-widest font-serif">Masculine</span>
                </button>
              </div>
            </div>

            {/* Identity */}
            <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-lavenderPurple mb-3 font-serif">Identity</label>
                <input
                    type="text"
                    placeholder="ENTER YOUR NAME"
                    className="w-full bg-black/40 border-b border-gold/30 px-4 py-3 text-lavender focus:border-lavenderPurple focus:shadow-[0_0_15px_var(--lavender-header)] focus:outline-none focus:bg-black/60 transition-all font-sans placeholder-lavenderDim/20"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-lavenderPurple mb-3 font-serif">Birth Date</label>
                    <input
                        type="date"
                        className="w-full bg-black/40 border-b border-gold/30 px-4 py-3 text-lavender focus:border-lavenderPurple focus:shadow-[0_0_15px_var(--lavender-header)] focus:outline-none focus:bg-black/60 transition-all font-sans uppercase text-sm"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-lavenderPurple mb-3 font-serif">Birth Time</label>
                    <input
                        type="time"
                        className="w-full bg-black/40 border-b border-gold/30 px-4 py-3 text-lavender focus:border-lavenderPurple focus:shadow-[0_0_15px_var(--lavender-header)] focus:outline-none focus:bg-black/60 transition-all font-sans uppercase text-sm"
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                </div>
            </div>

            {/* Origin Point */}
            <div>
                <label className="block text-xs uppercase tracking-[0.2em] text-lavenderPurple mb-3 font-serif">Birthplace</label>
                <input
                    type="text"
                    placeholder="CITY, COUNTRY"
                    className="w-full bg-black/40 border-b border-gold/30 px-4 py-3 text-lavender focus:border-lavenderPurple focus:shadow-[0_0_15px_var(--lavender-header)] focus:outline-none focus:bg-black/60 transition-all font-sans placeholder-lavenderDim/20"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                />
            </div>
        </div>

        {/* Biometric Uplink */}
        <div className="space-y-4 relative z-10 pt-4">
            <label className="block text-xs uppercase tracking-[0.2em] text-lavenderPurple font-serif text-center mb-6">Biometric Uplink</label>
            {!image ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-[1px] border-dashed border-gold rounded-[8px] h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-gold/5 transition-all group gap-4"
                >
                    <Camera className="w-8 h-8 text-gold group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-gold font-serif tracking-widest uppercase opacity-80 group-hover:opacity-100">Offer your likeness to the mirror</span>
                </div>
            ) : (
                <div className="flex justify-center items-center py-2 relative">
                    <div className="relative w-[200px] h-[200px] rounded-full border-[3px] border-gold shadow-[0_0_30px_rgba(212,175,55,0.3)] overflow-hidden">
                        <img 
                            src={image} 
                            alt="Reflection" 
                            className="w-full h-full object-cover transform scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    </div>
                    
                    <button 
                        type="button"
                        onClick={() => setImage(null)}
                        className="absolute top-0 right-1/2 translate-x-[90px] translate-y-[0px] bg-black/80 p-2 rounded-full text-gold border border-gold hover:bg-gold hover:text-black transition-all shadow-md z-20"
                        title="Clear Mirror"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
        </div>

        <button 
            type="submit" 
            className="w-full bg-gold text-black font-serif font-bold py-5 rounded-[4px] shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 uppercase tracking-[0.2em] relative z-10 mt-8"
        >
            Initiate Sequence
        </button>
      </form>
    </div>
  );
};

export default InputForm;