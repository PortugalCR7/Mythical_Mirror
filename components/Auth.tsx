import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  const signInGoogle = async () => {
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  };

  return (
    <div className="text-center pt-20 max-w-sm mx-auto">
      <h1 className="font-serif text-3xl text-gold uppercase tracking-widest mb-2">
        The Mirror
      </h1>
      <p className="text-gray-500 text-[10px] tracking-widest uppercase mb-10">
        Identify yourself to descend
      </p>

      {sent ? (
        <p className="text-gold/80 text-xs italic">
          A sigil has been sent to {email}. Follow the link to enter.
        </p>
      ) : (
        <>
          <form onSubmit={sendMagicLink} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent border border-gold/30 rounded-full px-5 py-3 text-xs text-gold placeholder-gray-600 focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              disabled={busy || !email}
              className="w-full text-gold border border-gold/40 px-8 py-3 rounded-full text-[10px] tracking-widest uppercase hover:bg-gold/10 disabled:opacity-40"
            >
              {busy ? 'Sending…' : 'Send Magic Link'}
            </button>
          </form>

          <div className="my-6 text-[10px] text-gray-600 tracking-widest">— or —</div>

          <button
            onClick={signInGoogle}
            disabled={busy}
            className="w-full text-white border border-white/30 px-8 py-3 rounded-full text-[10px] tracking-widest uppercase hover:bg-white/10 disabled:opacity-40"
          >
            Continue with Google
          </button>
        </>
      )}

      {error && <p className="text-red-500 text-[10px] mt-4">{error}</p>}
    </div>
  );
};

export default Auth;
