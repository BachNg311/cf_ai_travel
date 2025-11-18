import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.resolve(__dirname, '../../data/memory.json');

async function ensureFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initial = {
      profiles: {},
      conversations: {},
      plans: {}
    };
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2));
  }
}

async function readStore() {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeStore(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function getProfile(userId) {
  const store = await readStore();
  return store.profiles[userId] || null;
}

export async function upsertProfile(userId, profile) {
  const store = await readStore();
  store.profiles[userId] = {
    ...(store.profiles[userId] || {}),
    ...profile,
    updatedAt: new Date().toISOString()
  };
  await writeStore(store);
  return store.profiles[userId];
}

export async function appendConversation(userId, message) {
  const store = await readStore();
  const log = store.conversations[userId] || [];
  log.push({
    ...message,
    timestamp: message.timestamp || new Date().toISOString()
  });
  store.conversations[userId] = log.slice(-20);
  await writeStore(store);
  return store.conversations[userId];
}

export async function getConversation(userId) {
  const store = await readStore();
  return store.conversations[userId] || [];
}

export async function savePlan(userId, plan) {
  const store = await readStore();
  store.plans[userId] = {
    plan,
    savedAt: new Date().toISOString()
  };
  await writeStore(store);
  return store.plans[userId];
}

export async function getPlan(userId) {
  const store = await readStore();
  return store.plans[userId] || null;
}

export async function clearStore() {
  logger.warn('Clearing memory store');
  await writeStore({
    profiles: {},
    conversations: {},
    plans: {}
  });
}

