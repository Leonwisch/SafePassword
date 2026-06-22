'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    getPasswordEntries,
    createPasswordEntry,
    deletePasswordEntry,
    updatePasswordEntry
} from '../../../actions/passwords';

export default function DashboardPage() {
    const [currentUserEmail, setCurrentUserEmail] = useState<string>('');
    const [passwords, setPasswords] = useState<any[]>([]);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

    const [editingId, setEditingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newCategory, setNewCategory] = useState('Arbeit');
    const [newNotes, setNewNotes] = useState('');
    const [modalError, setModalError] = useState('');

    useEffect(() => {
        const savedEmail = localStorage.getItem('currentUserEmail');
        if (!savedEmail) {
            window.location.href = '/login';
        } else {
            setCurrentUserEmail(savedEmail);
        }
    }, []);

    useEffect(() => {
        if (currentUserEmail) {
            loadData();
        }
    }, [currentUserEmail]);

    const loadData = async () => {
        setIsLoading(true);
        const result = await getPasswordEntries(currentUserEmail);
        if (result.success && result.entries) {
            setPasswords(result.entries);
        }
        setIsLoading(false);
    };

    const togglePasswordVisibility = (id: string) => {
        setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Passwort kopiert!');
    };

    const openCreateModal = () => {
        setEditingId(null);
        setNewTitle('');
        setNewUsername('');
        setNewPassword('');
        setNewCategory('Arbeit');
        setNewNotes('');
        setModalError('');
        setIsModalOpen(true);
    };

    const handleEditClick = (entry: any) => {
        setEditingId(entry.id);
        setNewTitle(entry.title);
        setNewUsername(entry.username);
        setNewPassword('');
        setNewCategory(entry.category);
        setNewNotes(entry.notes);
        setModalError('');
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: string) => {
        if (confirm('Möchtest du diesen Eintrag wirklich endgültig löschen?')) {
            const result = await deletePasswordEntry(id);
            if (result.success) {
                loadData();
            } else {
                alert(result.error);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUserEmail) return;
        setModalError('');

        let result;

        if (editingId) {
            result = await updatePasswordEntry(editingId, {
                userEmail: currentUserEmail,
                title: newTitle,
                username: newUsername,
                passwordRaw: newPassword,
                categoryName: newCategory,
                notes: newNotes,
            });
        } else {
            result = await createPasswordEntry({
                userEmail: currentUserEmail,
                title: newTitle,
                username: newUsername,
                passwordRaw: newPassword,
                categoryName: newCategory,
                notes: newNotes,
            });
        }

        if (result.success) {
            setIsModalOpen(false);
            loadData();
        } else {
            setModalError(result.error || 'Fehler beim Speichern');
        }
    };

    const handleLogout = () => {
        if (confirm('Möchtest du dich wirklich abmelden?')) {
            localStorage.removeItem('currentUserEmail');
            window.location.href = '/';
        }
    };

    const filteredPasswords = passwords.filter(entry =>
        categoryFilter === 'All' ? true : entry.category === categoryFilter
    );

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 font-sans text-zinc-900 relative">

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight break-all">
                        Hallo <span className="text-zinc-500 font-medium">{currentUserEmail || 'Lade Account...'}</span>,
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">Hier sind deine geschützten Passwörter.</p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">

                    <div className="flex items-center gap-2 bg-zinc-50 px-4 py-2 rounded-2xl border border-zinc-200 shadow-sm">
                        <Image
                            src="/logo.png"
                            alt="Safe-Password Logo"
                            width={140}
                            height={40}
                            className="w-full h-auto object-contain"
                        />
                    </div>
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
                            className="bg-white border border-zinc-300 text-zinc-900 text-sm rounded-xl block w-48 p-2.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-400"
                        >
                            <option value="All">Alle Kategorien</option>
                            <option value="Arbeit">Arbeit</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Zuhause">Zuhause</option>
                        </select>
                    </div>

                    <button
                        onClick={openCreateModal}
                        disabled={!currentUserEmail}
                        className="bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-400 text-white font-medium py-2.5 px-5 rounded-xl transition shadow-sm active:scale-95 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
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
                                    <th scope="col" className="px-6 py-4 text-center">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPasswords.map((entry) => {
                                    const isVisible = !!visiblePasswords[entry.id];
                                    return (
                                        <tr key={entry.id} className="border-b border-zinc-100 hover:bg-zinc-50/80 transition">
                                            <td className="px-6 py-4 font-bold text-zinc-900">{entry.title}</td>
                                            <td className="px-6 py-4 text-zinc-700">{entry.username}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {isVisible ? (
                                                        <span className="font-mono text-sm bg-zinc-50 px-2 py-0.5 rounded border border-zinc-200 text-zinc-900">{entry.password}</span>
                                                    ) : (
                                                        <span className="font-mono text-lg tracking-widest text-zinc-400 select-none">••••••••</span>
                                                    )}

                                                    <div className="flex items-center gap-1.5 ml-2">
                                                        <button onClick={() => togglePasswordVisibility(entry.id)} className="text-zinc-400 hover:text-zinc-800 transition p-1" title={isVisible ? "Verbergen" : "Anzeigen"}>
                                                            {isVisible ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.011 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.011-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                            )}
                                                        </button>
                                                        <button onClick={() => copyToClipboard(entry.password)} className="text-zinc-400 hover:text-zinc-800 transition p-1" title="Kopieren">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-full text-xs font-medium border border-zinc-200">
                                                    {entry.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs max-w-xs truncate text-zinc-500">{entry.notes || '—'}</td>

                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleEditClick(entry)}
                                                        className="text-zinc-400 hover:text-blue-600 transition p-1"
                                                        title="Eintrag bearbeiten"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(entry.id)}
                                                        className="text-zinc-400 hover:text-red-600 transition p-1"
                                                        title="Eintrag löschen"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {!isLoading && filteredPasswords.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">Keine Einträge vorhanden.</div>
                    )}
                </div>

            </div>
            <div className="max-w-6xl mx-auto mt-8 flex justify-end">
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-5 rounded-xl transition shadow-sm active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-md flex flex-col animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 text-zinc-950">
                            {editingId ? 'Eintrag bearbeiten' : 'Neuer Passwort-Eintrag'}
                        </h2>

                        {modalError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-zinc-700">Website / Dienst (Titel)</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400 outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-zinc-700">Username / E-Mail</label>
                                <input
                                    type="text"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400 outline-none"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-zinc-700">
                                    Passwort {editingId && <span className="text-zinc-400 font-normal text-xs">(Leer lassen für keine Änderung)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={editingId ? "••••••••" : ""}
                                    required={!editingId}
                                    className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400 outline-none"
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-zinc-700">Kategorie</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400 outline-none"
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
                                    className="w-full p-2.5 border border-zinc-200 rounded-lg text-zinc-950 focus:ring-2 focus:ring-zinc-400 outline-none"
                                />
                            </div>

                            <div className="flex gap-3 mt-6 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-zinc-200 rounded-xl text-zinc-700 hover:bg-zinc-50 transition"
                                >
                                    Abbrechen
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-zinc-800 text-white rounded-xl font-medium hover:bg-zinc-700 transition"
                                >
                                    {editingId ? 'Änderungen speichern' : 'Sicher speichern'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}