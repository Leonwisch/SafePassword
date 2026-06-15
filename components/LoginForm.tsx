'use client';

import React, { useState } from 'react';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login versucht:', { username, password });
    alert('Login versucht (Backend-Logik fehlt noch)');
  };

  return (
    <div className="bg-zinc-50 p-8 rounded-3xl border border-gray-100 shadow-lg w-full max-w-lg flex flex-col">
      <h2 className="text-4xl font-bold mb-6 self-start text-zinc-950">Login</h2>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="username" className="text-sm font-medium text-zinc-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-zinc-200 rounded-lg bg-white text-zinc-950 focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <label htmlFor="password" className="text-sm font-medium text-zinc-700">
            Passwort
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-zinc-200 rounded-lg bg-white text-zinc-950 focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 transition"
            required
          />
        </div>

        <button
          type="submit"
          className="mt-6 w-full max-w-sm self-center bg-zinc-800 text-white p-3 rounded-xl font-semibold hover:bg-zinc-700 active:scale-[0.98] transition duration-150 ease-in-out"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;