import assert from 'node:assert';
import { FastifyReply, FastifyRequest } from 'fastify';
import { Bot } from 'grammy';
import { AGENTS, resolveAgent, runAgentLoop } from './agent';
import { loadSessions, saveSession } from './session';
import { compactSession } from './compaction';
import { getLock } from './session-lock';

const BOT_TOKEN = process.env.BOT_TOKEN;
assert(BOT_TOKEN);

const bot = new Bot(BOT_TOKEN);

const handleMessage = async () => {
  bot.on('message', async (ctx) => {
    const userText = ctx.message.text;

    if (!userText) {
      return;
    }

    const author = await ctx.getAuthor();
    const userId = String(author.user.id);
    const { agent, text: parsedText } = resolveAgent(userText);
    const resolvedAgent = AGENTS[agent];
    // this will allow us to run multiple agents without being blocked by the multex queue
    const sessionKey = `${resolvedAgent.sessionPrefix}:${userId}`;

    const text = await getLock(sessionKey).acquire(async () => {
      let sessionMessages = loadSessions(sessionKey);
      sessionMessages = await compactSession(sessionKey, sessionMessages);
      const userMessage = { role: 'user' as const, content: parsedText };
      // push it so that the bot has retained history of this
      sessionMessages.push(userMessage);

      const { text, messages } = await runAgentLoop(sessionMessages);
      // save the entire session
      saveSession(sessionKey, messages);
      return text;
    });

    await ctx.reply(text);
  });
};

const handleServerReq = async (req: FastifyRequest, rep: FastifyReply) => {
  const { userId, message } = req.body as { userId: string; message: string };
  const { agent, text: parsedText } = resolveAgent(message);
  const resolvedAgent = AGENTS[agent];
  const sessionKey = `${resolvedAgent.sessionPrefix}:${userId}`;

  const text = await getLock(sessionKey).acquire(async () => {
    let sessionMessages = loadSessions(sessionKey);
    sessionMessages = await compactSession(sessionKey, sessionMessages);
    sessionMessages.push({ role: 'user', content: parsedText });

    const { text, messages } = await runAgentLoop(sessionMessages);
    saveSession(sessionKey, messages);
    return text;
  });

  return rep.send({ response: text });
};

export { bot, handleMessage, handleServerReq };
