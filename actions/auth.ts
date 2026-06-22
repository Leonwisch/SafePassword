'use server';

import { prisma } from '../lib/prisma';
import * as argon2 from 'argon2';

export async function registerUser(email: string, masterPass: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'Diese E-Mail-Adresse wird bereits verwendet.' };
    }

    const masterHash = await argon2.hash(masterPass);

    await prisma.user.create({
      data: {
        email,
        masterHash,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten.' };
  }
}

export async function loginUser(email: string, masterPass: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'E-Mail-Adresse oder Passwort ungültig.' };
    }

    const isPasswordValid = await argon2.verify(user.masterHash, masterPass);

    if (!isPasswordValid) {
      return { success: false, error: 'E-Mail-Adresse oder Passwort ungültig.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Loginfehler:', error);
    return { success: false, error: 'Ein unerwarteter Fehler ist aufgetreten.' };
  }
}