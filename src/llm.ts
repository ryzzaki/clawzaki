import { Anthropic } from '@anthropic-ai/sdk';
import assert from 'node:assert';

const LLM_MODEL = 'claude-haiku-4-5';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

assert(ANTHROPIC_API_KEY);

const client = new Anthropic({
  apiKey: ANTHROPIC_API_KEY, // This is the default and can be omitted
});

export { LLM_MODEL, client };
