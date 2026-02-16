import { join } from 'node:path';
import fs from 'fs';
import { readdir } from 'fs/promises';

const MEMORIES_DIR = join(process.cwd(), 'memories');

export const saveMemory = (key: string, content: string) => {
  const memoryFile = join(MEMORIES_DIR, `${key}.md`);
  fs.writeFileSync(memoryFile, content, 'utf-8');
};

export const searchMemory = async (query: string) => {
  const lowered = query.toLowerCase();
  const results: string[] = [];

  const files = await readdir(MEMORIES_DIR, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith('.md')) {
      continue;
    }

    const loadedContent = fs.readFileSync(join(MEMORIES_DIR, file.name), 'utf-8').toLowerCase();
    const keyTerms = lowered.split(' ');
    const isMatched = keyTerms.some((term) => loadedContent.includes(term));

    if (isMatched) {
      results.push(`--- ${file.name} ---\n${loadedContent}`);
    }
  }

  return results.length > 0 ? results.join('\n\n') : 'No matching memories were found';
};
