import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-gold font-serif text-2xl uppercase tracking-widest mb-6">The Gate Opens</p>
        <p className="text-gray-400 text-[11px] tracking-wider leading-relaxed max-w-xs">
          A sacred link has been sent to{' '}
          <span className="text-lavender">{email}</span>.
          <br />Follow it to enter the mirror.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <p className="text-gold font-serif text-3xl uppercase tracking-widest mb-2 text-center">
        The Mythical Mirror
      </p>
      <p className="text-gray-500 text-[10px] tracking-widest uppercase mb-12 text-center">
        Enter your email to receive the key
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="bg-transparent border border-gold/30 rounded-full px-5 py-3 text-lavender text-[11px] tracking-wider placeholder-gray-600 focus:outline-none focus:border-gold/70 text-center"
        />
        {error && (
          <p className="text-red-400 text-[10px] text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="text-gold border border-gold/40 px-8 py-3 rounded-full text-[10px] tracking-widest uppercase hover:bg-gold/10 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Summoning...' : 'Send Sacred Link'}
        </button>
      </form>
    </div>
  );
};

export default Auth;
