
import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const ObsidianContainer: React.FC<Props> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen w-full bg-obsidian text-lavender font-sans selection:bg-gold selection:text-black relative ${className}`}>
        
        {/* LAYERED GRADIENT BACKGROUND */}
        {/* Uses CSS Variables defined in App.css for consistent theming */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,var(--obsidian-radial-center)_0%,var(--obsidian-bg)_50%,#000000_100%)] opacity-80"></div>
        
        {/* OPTIONAL NOISE TEXTURE FOR OBSIDIAN FEEL */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        {/* RESPONSIVE SCROLLABLE CANVAS */}
        <div className="relative z-10 w-full max-w-[600px] mx-auto min-h-screen flex flex-col px-6 py-12">
            {children}
        </div>
    </div>
  );
};

export default ObsidianContainer;
