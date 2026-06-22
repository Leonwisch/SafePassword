'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginUser } from '../actions/auth';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await loginUser(email, password);

    if (result.success) {
      localStorage.setItem('currentUserEmail', email.trim());

      router.push('/dashboard');
    } else {
      setError(result.error || 'Fehler beim Login');
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 shadow-md w-full max-w-md flex flex-col relative">

      <h2 className="text-4xl font-bold mb-6 self-start text-zinc-950">Login</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="email" className="text-sm font-medium text-zinc-700">E-Mail Adresse</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 border border-zinc-200 rounded-lg bg-white text-zinc-950 focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition disabled:opacity-50"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="password" className="text-sm font-medium text-zinc-700">Master-Passwort</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full p-3 border border-zinc-200 rounded-lg bg-white text-zinc-950 focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition disabled:opacity-50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full max-w-sm self-center bg-zinc-800 text-white p-3 rounded-xl font-semibold hover:bg-zinc-700 active:scale-[0.98] transition duration-150 ease-in-out disabled:opacity-50"
        >
          {isLoading ? 'Prüfe Daten...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-600">
        Noch keinen Account?{' '}
        <Link href="/register" className="font-semibold text-zinc-900 hover:underline">
          Hier registrieren
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;