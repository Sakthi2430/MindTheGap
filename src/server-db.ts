import fs from 'fs/promises';
import path from 'path';
import { User, Analysis } from './types.js';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface Schema {
  users: User[];
  analyses: Analysis[];
}

async function readDb(): Promise<Schema> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty schema
    return { users: [], analyses: [] };
  }
}

async function writeDb(schema: Schema): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(schema, null, 2), 'utf-8');
}

export async function getUserById(id: string): Promise<User | undefined> {
  const db = await readDb();
  return db.users.find(u => u.id === id);
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await readDb();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const db = await readDb();
  const newUser: User = {
    ...user,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  await writeDb(db);
  return newUser;
}

export async function createAnalysis(analysis: Omit<Analysis, 'id' | 'createdAt'>): Promise<Analysis> {
  const db = await readDb();
  const newAnalysis: Analysis = {
    ...analysis,
    id: Math.random().toString(36).substring(2, 15),
    createdAt: new Date().toISOString()
  };
  db.analyses.push(newAnalysis);
  await writeDb(db);
  return newAnalysis;
}

export async function getAnalysesByUserId(userId: string): Promise<Analysis[]> {
  const db = await readDb();
  return db.analyses
    .filter(a => a.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAnalysisById(id: string, userId: string): Promise<Analysis | undefined> {
  const db = await readDb();
  return db.analyses.find(a => a.id === id && a.userId === userId);
}

export async function checkDuplicateJobTitle(jobTitle: string, currentUserId: string): Promise<boolean> {
  const db = await readDb();
  return db.analyses.some(a => a.jobTitle.toLowerCase().trim() === jobTitle.toLowerCase().trim() && a.userId !== currentUserId);
}

