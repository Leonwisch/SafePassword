'use client';

import React, { useState, useEffect } from 'react';
import { getPasswordEntries, createPasswordEntry } from '../../../actions/passwords';

export default function DashboardPage() {
  const [passwords, setPasswords] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newCategory, setNewCategory] = useState('Arbeit');
  const [newNotes, setNewNotes] = useState('');
  const [modalError, setModalError] = useState('');

  const currentUserEmail = "leon.faessler@yahoo.com";

  const loadData = async () => {
    setIsLoading(true);
    const result = await getPasswordEntries(currentUserEmail);
    if (result.success && result.entries) {
      setPasswords(result.entries);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Passwort kopiert!');
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const result = await createPasswordEntry({
      userEmail: currentUserEmail,
      title: newTitle,
      username: newUsername,
      passwordRaw: newPassword,
      categoryName: newCategory,
      notes: newNotes,
    });

    if (result.success) {
      setNewTitle('');
      setNewUsername('');
      setNewPassword('');
      setNewCategory('Arbeit');
      setNewNotes('');
      setIsModalOpen(false);
      loadData();
    } else {
      setModalError(result.error || 'Fehler beim Speichern');
    }
  };

  const filteredPasswords = passwords.filter(entry => 
    categoryFilter === 'All' ? true : entry.category === categoryFilter
  );

  return (
    <div className="min-h-screen bg-white p-6 md:p-12 font-sans text-zinc-900 relative">
      
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Hallo <span className="text-zinc-600">User</span>, hier sind deine Passwörter:
        </h1>
        <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-200 shadow-sm">
          <span className="font-bold text-sm tracking-wider">SAFE-PASSWORD</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto bg-zinc-50 rounded-[2rem] border border-zinc-200 shadow-sm p-6 md:p-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-zinc-600">Kategorie</label>
            <select 
              id="category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg block w-48 p-2.5 shadow-sm"
            >
              <option value="All">Alle Kategorien</option>
              <option value="Arbeit">Arbeit</option>
              <option value="Social Media">Social Media</option>
              <option value="Zuhause">Zuhause</option>
            </select>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-5 rounded-xl transition shadow-sm active:scale-95"
          >
            Neuer Eintrag
          </button>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl border border-zinc-200 shadow-sm">
          {isLoading ? (
            <div className="text-center py-12 text-zinc-500">Lade verschlüsselte Passwörter...</div>
          ) : (
            <table className="w-full text-left text-sm text-zinc-600">
              <thead className="bg-zinc-100 text-zinc-800 font-semibold border-b border-zinc-200">
                <tr>
                  <th scope="col" className="px-6 py-4">Website / Dienst</th>
                  <th scope="col" className="px-6 py-4">Username</th>
                  <th scope="col" className="px-6 py-4">Passwort</th>
                  <th scope="col" className="px-6 py-4">Kategorie</th>
                  <th scope="col" className="px-6 py-4">Notizen</th>
                </tr>
              </thead>
              <tbody>
                {filteredPasswords.map((entry) => (
                  <tr key={entry.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition">
                    <td className="px-6 py-4 font-semibold text-zinc-900">{entry.title}</td>
                    <td className="px-6 py-4">{entry.username}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg tracking-widest text-zinc-400">••••••••</span>
                        <button onClick={() => copyToClipboard(entry.password)} className="text-zinc-500 hover:text-zinc-800 text-xs border border-zinc-200 px-2 py-1 rounded hover:bg-zinc-50 transition">
                          Kopieren
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium border border-zinc-200">
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs max-w-xs truncate">{entry.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!isLoading && filteredPasswords.length === 0 && (
            <div className="text-center py-12 text-zinc-500">Keine Einträge vorhanden.</div>
          )}
        </div>
      </div>

      {/* POPUP (MODAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-md flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-zinc-950">Neuer Passwort-Eintrag</h2>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateEntry} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700">Website / Dienst (Titel)</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="z.B. GitHub"
                  className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700">Username / E-Mail</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700">Passwort</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700">Kategorie</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400"
                >
                  <option value="Arbeit">Arbeit</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Zuhause">Zuhause</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-zinc-700">Notizen (Optional)</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Zusatzinfos..."
                  className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400"
                />
              </div>

              <div className="flex gap-3 mt-6 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-xl text-zinc-700 hover:bg-zinc-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700"
                >
                  Sicher speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}