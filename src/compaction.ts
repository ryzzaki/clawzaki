import { MessageParam } from '@anthropic-ai/sdk/resources';
import { client, LLM_MODEL } from './llm';
import { saveSession } from './session';

const COMPACTION_PROMPT = (messages: MessageParam[]) => `
Summarize this conversation concisely. Preserve:
- key facts about the user (name, preferences, etc.)
- important decisions made
- open tasks, unresolved issues or planned TODOs

${JSON.stringify(messages)}
`;

const estimateTokens = (messages: MessageParam[]) => {
  // about 4 chars per token
  return Math.floor(messages.reduce((a, b) => JSON.stringify(b).length + a, 0) / 4);
};

export const compactSession = async (userId: string, messages: MessageParam[]) => {
  // based off of a 128k window
  if (estimateTokens(messages) < 100_000) {
    return messages;
  }

  console.log('Compacting messages on window limit');
  const split = Math.floor(messages.length / 2);
  const [old, recent] = [messages.slice(0, split), messages.slice(split)];

  const summary = await client.messages.create({
    model: LLM_MODEL,
    max_tokens: 2000,
    messages: [{ role: 'user', content: COMPACTION_PROMPT(old) }],
  });

  const compaction: MessageParam[] = [
    { role: 'user', content: summary.content[0].type === 'text' ? summary.content[0].text : 'unavailable' },
  ];

  const completeCompation: MessageParam[] = [...compaction, ...recent];
  saveSession(userId, completeCompation);
  // return the new array
  return completeCompation;
};
