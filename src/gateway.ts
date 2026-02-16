import assert from 'node:assert';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Bot } from 'grammy';
import { runAgentLoop } from './agent';
import { loadSessions, saveSession } from './session';

const BOT_TOKEN = process.env.BOT_TOKEN;
assert(BOT_TOKEN);

const bot = new Bot(BOT_TOKEN);

const handleServerReq = async (req: FastifyRequest, rep: FastifyReply) => {
  const { userId, message } = req.body as { userId: string; message: string };
  const sessionMessages = loadSessions(userId);
  sessionMessages.push({ role: 'user', content: message });

  const { text, messages } = await runAgentLoop(sessionMessages);
  saveSession(userId, messages);

  return rep.send({ response: text });
};

const handleMessage = async () => {
  bot.on('message', async (ctx) => {
    const userText = ctx.message.text;

    if (!userText) {
      return;
    }

    const author = await ctx.getAuthor();
    const userId = String(author.user.id);

    const sessionMessages = loadSessions(userId);
    const userMessage = { role: 'user' as const, content: userText };
    // push it so that the bot has retained history of this
    sessionMessages.push(userMessage);

    const { text, messages } = await runAgentLoop(sessionMessages);
    // save the entire session
    saveSession(userId, messages);
    await ctx.reply(text);
  });
};

export { bot, handleMessage, handleServerReq };
