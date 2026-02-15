import { Anthropic } from '@anthropic-ai/sdk';
import { Bot } from 'grammy';
import assert from 'node:assert';
import { appendSession, loadSessions } from './session';
import { SOUL } from './agent';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const BOT_TOKEN = process.env.BOT_TOKEN;

assert(ANTHROPIC_API_KEY);
assert(BOT_TOKEN);

const LLM_MODEL = 'claude-haiku-4-5';

const client = new Anthropic({
  apiKey: ANTHROPIC_API_KEY, // This is the default and can be omitted
});

const bot = new Bot(BOT_TOKEN);

const handleMessage = async () => {
  bot.on('message', async (ctx) => {
    const userText = ctx.message.text;

    if (!userText) {
      return;
    }

    const author = await ctx.getAuthor();
    const userId = String(author.user.id);

    const messages = loadSessions(userId);
    const userMessage = { role: 'user' as const, content: userText };
    // push it so that the bot has retained history of this
    messages.push(userMessage);

    const message = await client.messages.create({
      max_tokens: 1024,
      messages,
      // the soul is inject here as the system prompt
      system: SOUL,
      model: LLM_MODEL,
    });

    appendSession(userId, userMessage);

    const block = message.content[0];
    if (block.type === 'text') {
      const assistantMessage = { role: 'assistant', content: block.text };
      appendSession(userId, assistantMessage);
      await ctx.reply(block.text);
    }
  });
};

export { bot, handleMessage };
