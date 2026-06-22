'use server';

import { prisma } from '../lib/prisma';
import { encryptPassword, decryptPassword } from '../lib/encryption';

export async function getPasswordEntries(userEmail: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        passwordEntries: {
          include: { category: true }
        }
      }
    });

    if (!user) return { success: false, entries: [] };

    const decryptedEntries = user.passwordEntries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      username: entry.username,
      password: decryptPassword(entry.encryptedPassword, entry.iv),
      category: entry.category.name,
      notes: entry.notes || '',
    }));
    
    return { success: true, entries: decryptedEntries };
  } catch (error) {
    console.error('Fehler beim Laden:', error);
    return { success: false, error: 'Fehler beim Laden der Passwörter.' };
  }
}

export async function createPasswordEntry(data: {
  userEmail: string;
  title: string;
  username: string;
  passwordRaw: string;
  categoryName: string;
  notes?: string;
}) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.userEmail },
    });

    if (!user) return { success: false, error: 'Benutzer nicht gefunden.' };

    let category = await prisma.category.findUnique({
      where: {
        name_userId: {
          name: data.categoryName,
          userId: user.id
        }
      }
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: data.categoryName,
          userId: user.id
        }
      });
    }

    const { encryptedPassword, iv } = encryptPassword(data.passwordRaw);

    await prisma.passwordEntry.create({
      data: {
        title: data.title,
        username: data.username,
        encryptedPassword,
        iv,
        notes: data.notes || '',
        userId: user.id,
        categoryId: category.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    return { success: false, error: 'Eintrag konnte nicht gespeichert werden.' };
  }
}