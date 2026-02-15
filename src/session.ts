import { join } from 'node:path';
import fs from 'fs';

type Message = {
  role: string;
  content: string;
};

const SESSIONS_DIR = join(process.cwd(), 'sessions');

const getSessionsDir = (userId: string) => {
  return join(SESSIONS_DIR, `${userId}.jsonl`);
};

// load sessions from a json file
export const loadSessions = (userId: string) => {
  const path = getSessionsDir(userId);
  const messages = [];

  try {
    const file = fs.readFileSync(path, 'utf-8');
    const lines = file.trim().split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      messages.push(JSON.parse(trimmed));
    }

    return messages;
  } catch (e) {
    if (e instanceof Error && (e as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw e;
  }
};

// adds to an existing sessions
export const appendSession = (userId: string, message: Message) => {
  const path = getSessionsDir(userId);
  const stringified = JSON.stringify(message);
  fs.appendFileSync(path, `${stringified}\n`, 'utf-8');
};

// overwrites an entire session with a complete list
export const saveSession = (userId: string, messages: Message[]) => {
  const path = getSessionsDir(userId);
  const stringified = messages.map((msg) => {
    return `${JSON.stringify(msg)}\n`;
  });

  fs.writeFileSync(path, JSON.stringify(stringified), 'utf-8');
};
