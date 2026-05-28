import React, { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AppState, BirthData, OracleResult } from '../services/types';
import { calculateCosmicFingerprint, selectArchetype } from '../services/cosmicCalc';
import { generateMythopoeticBrief, generateMythicImage } from '../services/geminiService';
import { saveReading } from '../services/dbService';
import { supabase } from '../services/supabaseClient';

// UI Components
import ObsidianContainer from './ObsidianContainer';
import InputForm from './InputForm';
import LoadingOracle from './LoadingOracle';
import ResultReveal from './ResultReveal';
import Auth from './Auth';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<OracleResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    reset();
  };

  const reset = () => {
    setResult(null);
    setAppState(AppState.IDLE);
    setErrorMessage(null);
  };

  const handleInitiate = async (data: BirthData) => {
    setAppState(AppState.ANALYZING);
    try {
      const fingerprint = calculateCosmicFingerprint(data);
      const matchedArchetype = selectArchetype(fingerprint, data.gender);

      setAppState(AppState.COMMUNING);

      const briefData = await generateMythopoeticBrief({
        name: data.name,
        date: data.date,
        location: data.location,
        cosmicFingerprint: fingerprint,
        archetypeRef: matchedArchetype
      }, data.image as string | undefined);

      let imageData: any = {};
      // CONDITIONAL IMAGE GENERATION: Only if birth data is present
      if (briefData.hasBirthData) {
        try {
          setAppState(AppState.MANIFESTING);
          const archetype = briefData.archetype_name || matchedArchetype.name;
          imageData = await generateMythicImage(data.image as string, briefData.visual_attire, archetype, fingerprint.bazi);
        } catch (err) {
          console.error("Image generation failed, proceeding with text only.", err);
          // imageData will be {}, so generatedImage will be undefined.
        }
      }

      // VALIDATION: Ensure we have a valid base64 image string if one was expected
      const hasValidImage = imageData && typeof imageData.image === 'string' && imageData.image.startsWith('data:image');
      const finalImage = hasValidImage ? imageData.image : undefined;

      const finalizedResult: OracleResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        birthData: data,
        fingerprint,
        archetype: matchedArchetype.name,
        profile: matchedArchetype.name,
        gift: briefData.gift || "Intuition",
        kin: briefData.kin || fingerprint.mayanKin,
        totem: briefData.totem || fingerprint.animalTotem,
        cosmicReadings: {
          hds: briefData.cosmic_readings?.hds || fingerprint.humanDesignProfile,
          gk: briefData.cosmic_readings?.gk || fingerprint.geneKeyGift,
          mayan: briefData.cosmic_readings?.mayan || fingerprint.mayanKin,
          soulLevel: briefData.cosmic_readings?.soulLevel || "The Guardian",
          biometric: briefData.cosmic_readings?.biometric || "Verdant Sentinel",
          bazi: briefData.cosmic_readings?.bazi || fingerprint.bazi,
          numerology: briefData.cosmic_readings?.numerology || `Life Path ${fingerprint.lifePathNumber}`,
          vedic: briefData.cosmic_readings?.vedic || fingerprint.nakshatra,
          sunSign: briefData.cosmic_readings?.sunSign || fingerprint.sunSignArchetype
        },
        mythopoeticBrief: {
          descent: briefData.descent || "Origin unknown.",
          reclamation: briefData.reclamation || "Path unclear.",
          devotion: briefData.devotion || "Meditate on silence.",
          visual_attire: briefData.visual_attire || matchedArchetype.name,
          one_liner: briefData.one_liner
        },
        generatedImage: finalImage,
        userImage: data.image,
        culture: briefData.culture || matchedArchetype.culture // Fallback will be handled by UI to avoid "Unknown"
      };

      setResult(finalizedResult);
      await saveReading(finalizedResult);

      // STATE TRANSITION: Only move to REVEALED if we have a result. 
      // The image check is already handled by finalImage being undefined if invalid.
      setAppState(AppState.REVEALED);
    } catch (err: any) {
      console.error("Sequence Failure:", err);
      setErrorMessage(err.message || "Unknown Failure");
      setAppState(AppState.ERROR);
    }
  };

  // Redesign flow: form-first, no auth gate at the front door.
  // The Auth component + session code stay in the file for the email-capture
  // step (deferred). IDLE renders InputForm directly with its own Surface,
  // so it bypasses ObsidianContainer's 600px centered constraint.
  if (appState === AppState.IDLE) {
    return <InputForm onSubmit={handleInitiate} />;
  }

  if (sessionLoading) {
    return <ObsidianContainer><div /></ObsidianContainer>;
  }

  return (
    <ObsidianContainer>
      {[AppState.ANALYZING, AppState.COMMUNING, AppState.MANIFESTING].includes(appState) && (
        <LoadingOracle state={appState} />
      )}

      {appState === AppState.REVEALED && result && (
        <ResultReveal result={result} onReset={reset} />
      )}

      {appState === AppState.ERROR && (
        <div className="text-center pt-20">
          <h2 className="text-red-500 font-serif text-2xl uppercase tracking-widest mb-4">Signal Interrupted</h2>
          <p className="text-gray-500 text-[10px] mb-8 max-w-xs mx-auto italic">{errorMessage}</p>
          <button onClick={reset} className="text-gold border border-gold/40 px-8 py-3 rounded-full text-[10px] tracking-widest uppercase hover:bg-gold/10">
            Retry Sequence
          </button>
        </div>
      )}
    </ObsidianContainer>
  );
};

export default App;